"use client";

import { useState, useRef } from "react";
import { createSantri } from "@/services/santri";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/TextArea";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { ChevronDownIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { Santri, SantriFormData } from "@/types/santri";

type Props = {
    initialData?: Santri;
    onSubmit?: (data: SantriFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function SantriForm({ initialData, onSubmit, onSuccess }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const frameRef = useRef<HTMLDivElement>(null);
    const [preview, setPreview] = useState<string | null>(
        initialData?.foto
            ? `http://127.0.0.1:8000/storage/${initialData.foto}`
            : null
    );

    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, px: 0, py: 0 });

    // Circle overlay drag state
    const [circlePos, setCirclePos] = useState({ x: 75, y: 100 }); // center of 150x200
    const [draggingCircle, setDraggingCircle] = useState(false);
    const [circleDragStart, setCircleDragStart] = useState({ mx: 0, my: 0, cx: 0, cy: 0 });
    const circleRadius = 60;

    const [form, setForm] = useState<SantriFormData>({
        nama: initialData?.nama || "",
        jenis_kelamin: initialData?.jenis_kelamin || "",
        tanggal_lahir: initialData?.tanggal_lahir || "",
        nama_wali: initialData?.nama_wali || "",
        kontak_wali: initialData?.kontak_wali || "",
        alamat: initialData?.alamat || "",
        tanggal_masuk: initialData?.tanggal_masuk || "",
        status: initialData?.status || "pending",
        foto: null,
    });

    const [loading, setLoading] = useState(false);

    const genderOptions = [
        { value: "L", label: "Laki-Laki" },
        { value: "P", label: "Perempuan" },
    ];

    const statusOptions = [
        { value: "pending", label: "Pending" },
        { value: "aktif", label: "Aktif" },
        { value: "lulus", label: "Lulus" },
        { value: "keluar", label: "Keluar" },
    ];

    const update = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.nama.trim()) {
            showToast("Nama santri wajib diisi", "error");
            return;
        }

        if (!form.jenis_kelamin) {
            showToast("Jenis kelamin wajib dipilih", "error");
            return;
        }

        if (!form.tanggal_lahir) {
            showToast("Tanggal lahir wajib diisi", "error");
            return;
        }

        if (!form.nama_wali.trim()) {
            showToast("Nama wali wajib diisi", "error");
            return;
        }

        if (!form.kontak_wali.trim()) {
            showToast("Kontak wali wajib diisi", "error");
            return;
        }

        if (!form.alamat.trim()) {
            showToast("Alamat wajib diisi", "error");
            return;
        }

        try {
            setLoading(true);

            if (onSubmit) {
                await onSubmit(form);

                onSuccess?.(
                    initialData
                        ? `Data ${form.nama} berhasil diperbarui!`
                        : `Santri ${form.nama} berhasil ditambahkan!`
                );
            } else {
                await createSantri(form);

                showToast(
                    `Santri ${form.nama} berhasil ditambahkan!`,
                    "success"
                );

                setTimeout(() => router.push("/santri"), 1500);
            }
        } catch (error) {
            console.error("Gagal menyimpan santri:", error);
            showToast("Gagal menyimpan data santri", "error");
        } finally {
            setLoading(false);
        }
    };

    // ── Drag foto handlers ──────────────────────────────────────
    const handleFrameMouseDown = (e: React.MouseEvent) => {
        if (!preview || draggingCircle) return;
        setDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY, px: pos.x, py: pos.y });
        e.preventDefault();
    };

    const handleFrameMouseMove = (e: React.MouseEvent) => {
        if (dragging) {
            setPos({ x: dragStart.px + (e.clientX - dragStart.x), y: dragStart.py + (e.clientY - dragStart.y) });
        }
        if (draggingCircle && frameRef.current) {
            const rect = frameRef.current.getBoundingClientRect();
            const nx = e.clientX - rect.left + (circleDragStart.cx - circleDragStart.mx + rect.left);
            const ny = e.clientY - rect.top + (circleDragStart.cy - circleDragStart.my + rect.top);
            setCirclePos({
                x: Math.max(circleRadius, Math.min(150 - circleRadius, nx)),
                y: Math.max(circleRadius, Math.min(200 - circleRadius, ny)),
            });
        }
    };

    const handleFrameMouseUp = () => { setDragging(false); setDraggingCircle(false); };

    // ── Drag circle overlay ─────────────────────────────────────
    const handleCircleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (frameRef.current) {
            const rect = frameRef.current.getBoundingClientRect();
            setDraggingCircle(true);
            setCircleDragStart({
                mx: e.clientX - rect.left,
                my: e.clientY - rect.top,
                cx: circlePos.x,
                cy: circlePos.y,
            });
        }
        e.preventDefault();
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

                    {/* ── Kiri: Foto Panel ── */}
                    <div className="mx-auto flex w-[150px] flex-shrink-0 flex-col gap-2 lg:mx-0">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">Foto Profil</span>
                            <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 font-medium">3×4</span>
                        </div>

                        {/* Frame foto */}
                        <div
                            ref={frameRef}
                            className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 select-none"
                            style={{
                                width: 150,
                                height: 200,
                                cursor: draggingCircle ? "move" : dragging ? "grabbing" : preview ? "grab" : "default",
                            }}
                            onMouseDown={handleFrameMouseDown}
                            onMouseMove={handleFrameMouseMove}
                            onMouseUp={handleFrameMouseUp}
                            onMouseLeave={handleFrameMouseUp}
                            onWheel={(e) => {
                                if (!preview) return;
                                e.preventDefault();
                                setScale(s => Math.min(3, Math.max(0.3, s - e.deltaY * 0.001)));
                            }}
                        >
                            {preview ? (
                                <>
                                    {/* Foto */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="absolute pointer-events-none"
                                        style={{
                                            transformOrigin: "0 0",
                                            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                                        }}
                                    />

                                    {/* Overlay gelap di luar lingkaran */}
                                    <svg
                                        className="absolute inset-0 pointer-events-none"
                                        width={150}
                                        height={200}
                                        style={{ zIndex: 2 }}
                                    >
                                        <defs>
                                            <mask id="circle-mask">
                                                <rect width={150} height={200} fill="white" />
                                                <circle cx={circlePos.x} cy={circlePos.y} r={circleRadius} fill="black" />
                                            </mask>
                                        </defs>
                                        {/* Gelap di luar lingkaran */}
                                        <rect
                                            width={150}
                                            height={200}
                                            fill="rgba(0,0,0,0.45)"
                                            mask="url(#circle-mask)"
                                        />
                                        {/* Border lingkaran */}
                                        <circle
                                            cx={circlePos.x}
                                            cy={circlePos.y}
                                            r={circleRadius}
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeDasharray="4 3"
                                            opacity="0.8"
                                        />
                                    </svg>

                                    {/* Drag handle untuk lingkaran */}
                                    <div
                                        className="absolute"
                                        style={{
                                            left: circlePos.x - circleRadius,
                                            top: circlePos.y - circleRadius,
                                            width: circleRadius * 2,
                                            height: circleRadius * 2,
                                            borderRadius: "50%",
                                            zIndex: 3,
                                            cursor: "move",
                                        }}
                                        onMouseDown={handleCircleMouseDown}
                                        title="Drag untuk atur posisi lingkaran profil"
                                    />

                                    {/* Label hint */}
                                    <div
                                        className="absolute bottom-1 left-0 right-0 text-center pointer-events-none"
                                        style={{ zIndex: 4 }}
                                    >
                                        <span className="text-[9px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded-full">
                                            drag foto / lingkaran
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-xs">Belum ada foto</span>
                                </div>
                            )}
                        </div>

                        {/* Zoom slider */}
                        {preview && (
                            <div className="flex items-center gap-1.5">
                                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                                <input
                                    type="range" min={30} max={300} step={1}
                                    value={Math.round(scale * 100)}
                                    onChange={(e) => setScale(parseInt(e.target.value) / 100)}
                                    className="w-full h-1 accent-brand-500"
                                />
                            </div>
                        )}

                        {/* Upload button */}
                        <label className="flex items-center justify-center gap-1.5 py-2 text-xs border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-600 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Pilih Foto
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setForm(prev => ({ ...prev, foto: file }));
                                    if (file) {
                                        setPreview(URL.createObjectURL(file));
                                        setPos({ x: 0, y: 0 });
                                        setScale(1);
                                        setCirclePos({ x: 75, y: 100 });
                                    }
                                }}
                            />
                        </label>

                        {/* Reset posisi */}
                        {preview && (
                            <button
                                type="button"
                                onClick={() => { setPos({ x: 0, y: 0 }); setScale(1); setCirclePos({ x: 75, y: 100 }); }}
                                className="text-[11px] text-gray-400 hover:text-gray-600 text-center underline underline-offset-2 transition-colors"
                            >
                                Reset posisi
                            </button>
                        )}
                    </div>

                    <div className="w-full flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Nama Santri <span className="text-error-500">*</span></Label>
                                <Input
                                    type="text"
                                    value={form.nama}
                                    placeholder="Masukkan nama santri"
                                    onChange={(e) => update("nama", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Jenis Kelamin <span className="text-error-500">*</span></Label>
                                <div className="relative">
                                    <Select
                                        options={genderOptions}
                                        defaultValue={form.jenis_kelamin}
                                        placeholder="Pilih jenis kelamin"
                                        onChange={(value) => update("jenis_kelamin", value)}
                                        className="dark:bg-dark-900"
                                    />
                                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                        <ChevronDownIcon />
                                    </span>
                                </div>
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
                                    update("tanggal_masuk", birthDate.toISOString().split("T")[0]);
                                }
                            }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Nama Wali <span className="text-error-500">*</span></Label>
                                <Input
                                    type="text"
                                    value={form.nama_wali}
                                    placeholder="Masukkan nama wali"
                                    onChange={(e) => update("nama_wali", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Kontak Wali <span className="text-error-500">*</span></Label>
                                <Input
                                    type="number"
                                    value={form.kontak_wali}
                                    placeholder="08123456789"
                                    onChange={(e) => update("kontak_wali", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Alamat</Label>
                            <TextArea
                                value={form.alamat}
                                onChange={(value) => update("alamat", value)}
                                rows={4}
                            />
                        </div>

                        {initialData && (
                            <div>
                                <Label>Status</Label>
                                <div className="relative">
                                    <select
                                        value={form.status}
                                        onChange={(e) => update("status", e.target.value)}
                                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    >
                                        {statusOptions.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                                        <ChevronDownIcon />
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${form.status === "aktif" ? "bg-green-100 text-green-700" :
                                        form.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                            form.status === "lulus" ? "bg-blue-100 text-blue-700" :
                                                "bg-red-100 text-red-700"
                                        }`}>
                                        {statusOptions.find(s => s.value === form.status)?.label}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
                            >
                                {loading ? "Menyimpan..." : "Simpan"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/santri")}
                                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </div>

                    {toast.show && (
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            onClose={hideToast}
                        />
                    )}
                </div>
            </form >
        </>
    );
}