"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import DatePicker from "@/components/form/date-picker";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { getSantri } from "@/services/santri";
import { Santri } from "@/types/santri";
import { KeuanganSpp, KeuanganSppFormData } from "@/types/keuangan-spp";
import { createKeuanganSpp } from "@/services/keuangan-spp";

type Props = {
    initialData?: KeuanganSpp;
    onSubmit?: (data: KeuanganSppFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

const bulanOptions = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
];

const onlyNumber = (value: string) => {
    return value.replace(/\D/g, "");
};

export default function KeuanganSppForm({
    initialData,
    onSubmit,
    onSuccess,
}: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    const searchBoxRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [santriList, setSantriList] = useState<Santri[]>([]);
    const [santriLoading, setSantriLoading] = useState(true);

    const [santriSearch, setSantriSearch] = useState("");
    const [isSantriDropdownOpen, setIsSantriDropdownOpen] = useState(false);

    const now = new Date();

    const [form, setForm] = useState<KeuanganSppFormData>({
        student_id: initialData?.student_id || "",
        payment_date: initialData?.payment_date || "",
        month: initialData?.month || now.getMonth() + 1,
        year: initialData?.year || now.getFullYear(),
        amount: initialData?.amount || "",
        note: initialData?.note || "",
    });

    const selectedSantri = useMemo(() => {
        return santriList.find(
            (santri) => String(santri.id) === String(form.student_id)
        );
    }, [santriList, form.student_id]);

    const filteredSantri = useMemo(() => {
        const keyword = santriSearch.trim().toLowerCase();

        if (!keyword) return santriList.slice(0, 8);

        return santriList
            .filter((santri) => {
                return (
                    santri.name.toLowerCase().includes(keyword) ||
                    (santri.nisn || "").toLowerCase().includes(keyword) ||
                    (santri.nik || "").toLowerCase().includes(keyword) ||
                    (santri.student_number || "").toLowerCase().includes(keyword) ||
                    (santri.tpq_number || "").toLowerCase().includes(keyword) ||
                    (santri.study_class?.name || "").toLowerCase().includes(keyword)
                );
            })
            .slice(0, 10);
    }, [santriList, santriSearch]);

    useEffect(() => {
        let ignore = false;

        getSantri()
            .then((data) => {
                if (ignore) return;

                setSantriList(
                    data.filter((item: Santri) => item.status === "active")
                );
            })
            .catch(console.error)
            .finally(() => {
                if (!ignore) setSantriLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, []);

    useEffect(() => {
        let ignore = false;

        getSantri()
            .then((data) => {
                if (ignore) return;

                const activeSantri = data.filter(
                    (item: Santri) => item.status === "active"
                );

                setSantriList(activeSantri);

                if (initialData?.student_id) {
                    const selected = activeSantri.find(
                        (item: Santri) =>
                            String(item.id) === String(initialData.student_id)
                    );

                    if (selected) {
                        setSantriSearch(
                            `${selected.name}${selected.nisn ? ` - ${selected.nisn}` : ""}`
                        );
                    }
                }
            })
            .catch(console.error)
            .finally(() => {
                if (!ignore) setSantriLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [initialData?.student_id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target as Node)
            ) {
                setIsSantriDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const update = (field: keyof KeuanganSppFormData, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSelectSantri = (santri: Santri) => {
        update("student_id", santri.id);
        setSantriSearch(`${santri.name}${santri.nisn ? ` - ${santri.nisn}` : ""}`);
        setIsSantriDropdownOpen(false);
    };

    const handleClearSantri = () => {
        update("student_id", "");
        setSantriSearch("");
        setIsSantriDropdownOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.student_id) {
            showToast("Santri wajib dipilih", "error");
            return;
        }

        if (!form.payment_date) {
            showToast("Tanggal wajib diisi", "error");
            return;
        }

        if (!form.month) {
            showToast("Bulan wajib dipilih", "error");
            return;
        }

        if (!form.year) {
            showToast("Tahun wajib diisi", "error");
            return;
        }

        if (!String(form.amount).trim()) {
            showToast("Nominal wajib diisi", "error");
            return;
        }

        try {
            setLoading(true);

            if (onSubmit) {
                await onSubmit(form);

                onSuccess?.(
                    initialData
                        ? "Data SPP berhasil diperbarui!"
                        : "Data SPP berhasil ditambahkan!"
                );
            } else {
                await createKeuanganSpp(form);

                showToast("Data SPP berhasil ditambahkan!", "success");

                setTimeout(() => router.push("/keuangan-spp"), 1500);
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan data SPP", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                    Data Pembayaran SPP
                </h3>

                <div className="space-y-4">
                    <div ref={searchBoxRef} className="relative">
                        <Label>
                            Santri <span className="text-error-500">*</span>
                        </Label>

                        <div className="relative">
                            <input
                                type="text"
                                value={santriSearch}
                                placeholder={
                                    santriLoading
                                        ? "Memuat data santri..."
                                        : "Cari nama, NISN, NIK, atau kelas santri"
                                }
                                disabled={santriLoading}
                                onFocus={() => setIsSantriDropdownOpen(true)}
                                onChange={(e) => {
                                    setSantriSearch(e.target.value);
                                    update("student_id", "");
                                    setIsSantriDropdownOpen(true);
                                }}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 pr-10 text-sm text-gray-700 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />

                            {form.student_id ? (
                                <button
                                    type="button"
                                    onClick={handleClearSantri}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                            ) : (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    🔍
                                </span>
                            )}
                        </div>

                        {isSantriDropdownOpen && (
                            <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                {filteredSantri.length === 0 ? (
                                    <div className="px-4 py-5 text-center text-sm text-gray-400">
                                        Santri tidak ditemukan
                                    </div>
                                ) : (
                                    filteredSantri.map((santri) => (
                                        <button
                                            key={santri.id}
                                            type="button"
                                            onClick={() => handleSelectSantri(santri)}
                                            className={`block w-full px-4 py-3 text-left hover:bg-brand-50 dark:hover:bg-white/5 ${String(form.student_id) === String(santri.id)
                                                ? "bg-brand-50"
                                                : ""
                                                }`}
                                        >
                                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                {santri.name}
                                            </p>

                                            <p className="mt-0.5 text-xs text-gray-500">
                                                NISN: {santri.nisn || "-"} · NIK:{" "}
                                                {santri.nik || "-"}
                                            </p>

                                            <p className="mt-0.5 text-xs text-gray-400">
                                                Kelas: {santri.study_class?.name || "Tanpa kelas"}
                                            </p>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {selectedSantri && (
                            <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 p-3">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {selectedSantri.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            NISN: {selectedSantri.nisn || "-"} · Kelas:{" "}
                                            {selectedSantri.study_class?.name || "Tanpa kelas"}
                                        </p>
                                    </div>

                                    <span className="mt-2 inline-flex w-fit rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 sm:mt-0">
                                        Santri dipilih
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DatePicker
                            id="tanggal-spp"
                            label="Tanggal Pembayaran"
                            placeholder="Pilih tanggal"
                            defaultDate={form.payment_date || undefined}
                            onChange={(_, value) => update("payment_date", value)}
                        />
                        <div>
                            <Label>
                                Nominal <span className="text-error-500">*</span>
                            </Label>

                            <Input
                                type="text"
                                inputMode="numeric"
                                value={String(form.amount || "")}
                                placeholder="Contoh: 50000"
                                onChange={(e) =>
                                    update("amount", onlyNumber(e.target.value))
                                }
                            />

                            <p className="mt-1 text-xs text-gray-400">
                                Masukkan nominal tanpa titik atau koma. Contoh: 50000
                            </p>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label>
                                Bulan SPP <span className="text-error-500">*</span>
                            </Label>

                            <select
                                value={form.month}
                                onChange={(e) => update("month", Number(e.target.value))}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            >
                                <option value="">Pilih bulan</option>
                                {bulanOptions.map((bulan) => (
                                    <option key={bulan.value} value={bulan.value}>
                                        {bulan.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>
                                Tahun <span className="text-error-500">*</span>
                            </Label>

                            <Input
                                type="text"
                                inputMode="numeric"
                                value={String(form.year || "")}
                                placeholder="Contoh: 2026"
                                onChange={(e) =>
                                    update("year", onlyNumber(e.target.value))
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Keterangan</Label>

                        <Input
                            type="text"
                            value={form.note || ""}
                            placeholder="Keterangan opsional"
                            onChange={(e) => update("note", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
                >
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/keuangan-spp")}
                    className="w-full rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 sm:w-auto"
                >
                    Batal
                </button>
            </div>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </form>
    );
}