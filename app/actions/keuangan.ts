"use server";

import prisma from "@/lib/prisma";
import { TipeKeuangan } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getKeuangan() {
  try {
    const transactions = await prisma.keuangan.findMany({
      orderBy: { date: "desc" },
    });

    const totalPemasukan = transactions
      .filter((t) => t.type === TipeKeuangan.PEMASUKAN)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalPengeluaran = transactions
      .filter((t) => t.type === TipeKeuangan.PENGELUARAN)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const saldoKas = totalPemasukan - totalPengeluaran;

    return {
      success: true,
      data: {
        transactions,
        totalPemasukan,
        totalPengeluaran,
        saldoKas,
      },
    };
  } catch (error) {
    console.error("Error fetching keuangan:", error);
    return { success: false, error: "Gagal mengambil data keuangan" };
  }
}

export async function createKeuangan(formData: {
  type: "PEMASUKAN" | "PENGELUARAN";
  category: string;
  amount: number;
  description: string;
  date?: string;
}) {
  try {
    const newTx = await prisma.keuangan.create({
      data: {
        type: formData.type as TipeKeuangan,
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
        date: formData.date ? new Date(formData.date) : new Date(),
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "created",
        entity: "Keuangan",
        description: `Mencatat ${formData.type.toLowerCase()} Rp ${formData.amount.toLocaleString("id-ID")}`,
        user: "Bendahara RIMBA",
      },
    });

    revalidatePath("/admin/keuangan");
    revalidatePath("/admin");
    return { success: true, data: newTx };
  } catch (error) {
    console.error("Error creating keuangan:", error);
    return { success: false, error: "Gagal mecatat transaksi" };
  }
}

export async function importKeuanganBulk(
  transactions: {
    type: "PEMASUKAN" | "PENGELUARAN";
    category: string;
    amount: number;
    description: string;
    date: string;
  }[]
) {
  try {
    // Ambil data yang sudah ada untuk pengecekan duplikat
    const existing = await prisma.keuangan.findMany({
      select: {
        date: true,
        category: true,
        amount: true,
      },
    });

    const existingKeys = new Set(
      existing.map(
        (e) =>
          `${new Date(e.date).toISOString().split("T")[0]}-${e.category}-${e.amount}`
      )
    );

    // Filter data yang belum ada
    const toCreate = transactions
      .filter((t) => {
        const key = `${new Date(t.date).toISOString().split("T")[0]}-${t.category}-${t.amount}`;
        return !existingKeys.has(key);
      })
      .map((t) => ({
        type: t.type as TipeKeuangan,
        category: t.category,
        amount: t.amount,
        description: t.description,
        date: new Date(t.date),
      }));

    if (toCreate.length === 0) {
      return { success: true, count: 0, skipped: transactions.length };
    }

    const created = await prisma.keuangan.createMany({
      data: toCreate,
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "created",
        entity: "Keuangan",
        description: `Import massal ${created.count} transaksi keuangan`,
        user: "Bendahara RIMBA",
      },
    });

    revalidatePath("/admin/keuangan");
    revalidatePath("/admin");

    return {
      success: true,
      count: created.count,
      skipped: transactions.length - created.count,
    };
  } catch (error) {
    console.error("Error importing keuangan:", error);
    return { success: false, error: "Gagal mengimport data keuangan" };
  }
}
