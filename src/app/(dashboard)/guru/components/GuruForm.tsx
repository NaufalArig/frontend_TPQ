"use client";

import { useRef, useState } from "react";
import { createGuru } from "@/services/guru";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/TextArea";
import { useRouter } from "next/navigation";
import { Guru, GuruFormData } from "@/types/guru";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";

type Props = {
    initialData?: Guru;
    onSubmit?: (data: GuruFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

export default function GuruForm({ initialData, onSubmit, onSuccess }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const frameRef = useRef<HTMLDivElement>(null);

    // Foto state
    const [preview, setPreview] = useState<string | null>(
        initialData?.foto ? `http://127.0.0.1:8000/storage/${initialData.foto}` : null
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

    const [form, setForm] = useState<GuruFormData>({
        nama: initialData?.nama || "",
        alamat: initialData?.alamat || "",
        kontak: initialData?.kontak || "",
        tanggal_masuk: initialData?.tanggal_masuk || "", // kosong by default
        tanggal_keluar: initialData?.tanggal_keluar || "",
        status: initialData?.status || "pending",
        foto: null,
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const update = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.nama.trim()) { showToast("Nama guru wajib diisi", "error"); return; }
        if (!form.tanggal_masuk) { showToast("Tanggal masuk wajib dipilih", "error"); return; }
        if (!form.kontak.trim()) { showToast("Kontak wajib diisi", "error"); return; }
        if (!form.alamat.trim()) { showToast("Alamat wajib diisi", "error"); return; }

        try {
            setLoading(true);
            if (onSubmit) {
                await onSubmit(form);
                onSuccess?.(initialData ? `Data ${form.nama} berhasil diperbarui!` : `Guru ${form.nama} berhasil ditambahkan!`);
            } else {
                await createGuru(form);
                showToast(`Guru ${form.nama} berhasil ditambahkan!`, "success");
                setTimeout(() => router.push("/guru"), 1500);
            }
        } catch (error) {
            console.error("Gagal menyimpan guru:", error);
            showToast("Gagal menyimpan data guru", "error");
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

                    {/* ── Kanan: Form Fields ── */}
                    <div className="w-full flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Nama Guru</Label>
                                <Input
                                    type="text"
                                    value={form.nama}
                                    onChange={(e) => update("nama", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Kontak</Label>
                                <Input
                                    type="text"
                                    value={form.kontak}
                                    placeholder="08123456789"
                                    onChange={(e) => update("kontak", e.target.value)}
                                />
                            </div>
                        </div>

                        {!initialData && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label>Email Login</Label>
                                    <Input
                                        type="email"
                                        value={form.email || ""}
                                        placeholder="guru@email.com"
                                        onChange={(e) => update("email", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Password Login</Label>
                                    <Input
                                        type="password"
                                        value={form.password || ""}
                                        placeholder="Minimal 6 karakter"
                                        onChange={(e) => update("password", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <Label>Alamat</Label>
                            <TextArea
                                value={form.alamat}
                                onChange={(e) => update("alamat", e)}
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DatePicker
                                id="tanggal-masuk"
                                label="Tanggal Masuk"
                                placeholder="Pilih tanggal masuk"
                                defaultDate={form.tanggal_masuk || undefined}
                                onChange={(_, val) => update("tanggal_masuk", val)}
                            />

                            {initialData && (
                                <DatePicker
                                    id="tanggal-keluar"
                                    label="Tanggal Keluar"
                                    placeholder="Opsional"
                                    defaultDate={form.tanggal_keluar || undefined}
                                    onChange={(_, val) => update("tanggal_keluar", val)}
                                />
                            )}
                        </div>

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
                                onClick={() => router.push("/guru")}
                                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>

                {toast.show && (
                    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
                )}
            </form>
        </>
    );
}