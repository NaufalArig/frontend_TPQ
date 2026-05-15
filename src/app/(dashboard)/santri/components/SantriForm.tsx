"use client";

import { useState } from "react";
import { createSantri } from "@/services/santri";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/TextArea";
import { ChevronDownIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { Santri, SantriFormData } from "@/types/santri";

type Props = {
    initialData?: Santri;
    onSubmit?: (data: SantriFormData) => Promise<void>;
};

export default function SantriForm({
    initialData,
    onSubmit,
}: Props) {
    const router = useRouter();

    const [form, setForm] = useState<SantriFormData>({
        nama: initialData?.nama || "",
        jenis_kelamin: initialData?.jenis_kelamin || "",
        tanggal_lahir: initialData?.tanggal_lahir || "",
        nama_wali: initialData?.nama_wali || "",
        kontak_wali: initialData?.kontak_wali || "",
        alamat: initialData?.alamat || "",
        tanggal_masuk: initialData?.tanggal_masuk || "",
        status: initialData?.status || "pending",
    });

    const [loading, setLoading] = useState(false);

    const options = [
        { value: "L", label: "Laki-Laki" },
        { value: "P", label: "Perempuan" },
    ];

    const update = (field: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSelectChange = (value: string) => {
        update("jenis_kelamin", value as "L" | "P");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (onSubmit) {
                await onSubmit(form);
            } else {
                await createSantri(form);
            }

            router.push("/santri");
        } catch (error) {
            console.error("Gagal menyimpan santri:", error);
            alert("Gagal menyimpan data santri");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">

            <div>
                <Label>Nama Santri</Label>
                <Input
                    type="text"
                    value={form.nama}
                    onChange={(e) =>
                        update("nama", e.target.value)
                    }
                />
            </div>

            <div>
                <Label>Jenis Kelamin</Label>
                <div className="relative">
                    <Select
                        options={options}
                        defaultValue={form.jenis_kelamin}
                        placeholder="Pilih jenis kelamin"
                        onChange={handleSelectChange}
                        className="dark:bg-dark-900"
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                        <ChevronDownIcon />
                    </span>
                </div>
            </div>

            <DatePicker
                id="tanggal-lahir"
                label="Tanggal Lahir"
                placeholder="Pilih tanggal lahir"
                defaultDate={form.tanggal_lahir}
                onChange={(_, currentDateString) => {
                    update("tanggal_lahir", currentDateString);

                    const birthDate = new Date(currentDateString);

                    if (!isNaN(birthDate.getTime())) {
                        birthDate.setFullYear(birthDate.getFullYear() + 3);

                        const tanggalMasuk = birthDate.toISOString().split("T")[0];

                        update("tanggal_masuk", tanggalMasuk);
                    }
                }}
            />

            <div>
                <Label>Nama Wali</Label>
                <Input
                    type="text"
                    value={form.nama_wali}
                    onChange={(e) => update("nama_wali", e.target.value)}
                />
            </div>

            <div>
                <Label>Kontak Wali</Label>
                <Input
                    type="number"
                    value={form.kontak_wali}
                    placeholder="08123456789"
                    onChange={(e) => update("kontak_wali", e.target.value)}
                />
            </div>

            <div>
                <Label>Alamat</Label>
                <TextArea
                    value={form.alamat}
                    onChange={(value) => update("alamat", value)}
                    rows={6}
                />
            </div>
            {initialData && (
                <div>
                    <Label>Status</Label>
                    <select
                        value={form.status}
                        onChange={(e) => update("status", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="pending">pending</option>
                        <option value="aktif">aktif</option>
                        <option value="lulus">lulus</option>
                        <option value="keluar">keluar</option>
                    </select>
                </div>
            )}
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
                {loading ? "Menyimpan..." : "Simpan"}
            </button>
        </form>
    );
}