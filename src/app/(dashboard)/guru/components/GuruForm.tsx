"use client";

import { useRef, useState, useEffect } from "react";
import { createGuru } from "@/services/guru";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import DatePicker from "@/components/form/date-picker";
import TextArea from "@/components/form/TextArea";
import { useRouter } from "next/navigation";
import { Guru, GuruFormData } from "@/types/guru";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import API_URL from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

type Props = {
    initialData?: Guru;
    onSubmit?: (data: GuruFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

const STORAGE_URL = API_URL.replace(/\/api\/?$/, "/storage");

function getPhotoUrl(photo?: string | null) {
    if (!photo) return null;

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
        return photo;
    }

    return `${STORAGE_URL}/${photo}`;
}

type RegionOption = {
    code: string;
    name: string;
};

const REGION_API_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";

const FALLBACK_PROVINCES: RegionOption[] = [
    { code: "11", name: "Aceh" },
    { code: "12", name: "Sumatera Utara" },
    { code: "13", name: "Sumatera Barat" },
    { code: "14", name: "Riau" },
    { code: "15", name: "Jambi" },
    { code: "16", name: "Sumatera Selatan" },
    { code: "17", name: "Bengkulu" },
    { code: "18", name: "Lampung" },
    { code: "19", name: "Kepulauan Bangka Belitung" },
    { code: "21", name: "Kepulauan Riau" },
    { code: "31", name: "DKI Jakarta" },
    { code: "32", name: "Jawa Barat" },
    { code: "33", name: "Jawa Tengah" },
    { code: "34", name: "DI Yogyakarta" },
    { code: "35", name: "Jawa Timur" },
    { code: "36", name: "Banten" },
    { code: "51", name: "Bali" },
    { code: "52", name: "Nusa Tenggara Barat" },
    { code: "53", name: "Nusa Tenggara Timur" },
    { code: "61", name: "Kalimantan Barat" },
    { code: "62", name: "Kalimantan Tengah" },
    { code: "63", name: "Kalimantan Selatan" },
    { code: "64", name: "Kalimantan Timur" },
    { code: "65", name: "Kalimantan Utara" },
    { code: "71", name: "Sulawesi Utara" },
    { code: "72", name: "Sulawesi Tengah" },
    { code: "73", name: "Sulawesi Selatan" },
    { code: "74", name: "Sulawesi Tenggara" },
    { code: "75", name: "Gorontalo" },
    { code: "76", name: "Sulawesi Barat" },
    { code: "81", name: "Maluku" },
    { code: "82", name: "Maluku Utara" },
    { code: "91", name: "Papua Barat" },
    { code: "92", name: "Papua Barat Daya" },
    { code: "93", name: "Papua Selatan" },
    { code: "94", name: "Papua" },
    { code: "95", name: "Papua Pegunungan" },
    { code: "96", name: "Papua Tengah" },
];

const sameRegionName = (a?: string | null, b?: string | null) => {
    return (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
};

const formatRegionName = (name: string) => {
    const words = name.trim().replace(/\s+/g, " ").split(" ");
    const mergedWords: string[] = [];

    for (let i = 0; i < words.length; i++) {
        if (words[i].length === 1) {
            const letters = [words[i]];
            let nextIndex = i + 1;

            while (nextIndex < words.length && words[nextIndex].length === 1) {
                letters.push(words[nextIndex]);
                nextIndex++;
            }

            mergedWords.push(letters.join(""));
            i = nextIndex - 1;
        } else {
            mergedWords.push(words[i]);
        }
    }

    return mergedWords
        .join(" ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\bDki\b/g, "DKI")
        .replace(/\bDi\b/g, "DI");
};

const fetchRegions = async (path: string): Promise<RegionOption[]> => {
    try {
        const response = await fetch(`${REGION_API_URL}/${path}`);

        if (!response.ok) {
            throw new Error("Gagal mengambil data wilayah");
        }

        const result = await response.json();
        const items = Array.isArray(result) ? result : result.data;

        if (!Array.isArray(items)) {
            return path === "provinces.json" ? FALLBACK_PROVINCES : [];
        }

        return items.map((item) => ({
            code: String(item.code ?? item.id ?? ""),
            name: formatRegionName(String(item.name ?? item.nama ?? "")),
        })).filter((item) => item.code && item.name);
    } catch (error) {
        console.error("Gagal mengambil data wilayah:", error);

        return path === "provinces.json" ? FALLBACK_PROVINCES : [];
    }
};

export default function GuruForm({ initialData, onSubmit, onSuccess }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const frameRef = useRef<HTMLDivElement>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Foto state
    const [preview, setPreview] = useState<string | null>(
        getPhotoUrl(initialData?.photo)
    );
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, px: 0, py: 0 });

    const [provinces, setProvinces] = useState<RegionOption[]>([]);
    const [regencies, setRegencies] = useState<RegionOption[]>([]);
    const [districts, setDistricts] = useState<RegionOption[]>([]);
    const [villages, setVillages] = useState<RegionOption[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
    const [selectedRegencyCode, setSelectedRegencyCode] = useState("");
    const [selectedDistrictCode, setSelectedDistrictCode] = useState("");

    // Circle overlay drag state
    const [circlePos, setCirclePos] = useState({ x: 75, y: 100 }); // center of 150x200
    const [draggingCircle, setDraggingCircle] = useState(false);
    const [circleDragStart, setCircleDragStart] = useState({ mx: 0, my: 0, cx: 0, cy: 0 });
    const circleRadius = 60;

    const [form, setForm] = useState<GuruFormData>({
        username: "",
        email: "",
        password: "",

        teacher_number: initialData?.teacher_number || "",
        tpq_number: initialData?.tpq_number || "",
        name: initialData?.name || "",
        gender: initialData?.gender || "",
        birth_place: initialData?.birth_place || "",
        birth_date: initialData?.birth_date || "",

        address: initialData?.address || "",
        village: initialData?.village || "",
        district: initialData?.district || "",
        city: initialData?.city || "",
        province: initialData?.province || "",

        phone: initialData?.phone || "",
        certificate_from: initialData?.certificate_from || "",
        certificate_number: initialData?.certificate_number || "",
        education: initialData?.education || "",

        join_date: initialData?.join_date || "",
        leave_date: initialData?.leave_date || "",
        photo: null,
    });

    const [loading, setLoading] = useState(false);
    const passwordValue = form.password || "";
    const passwordChecks = {
        length: passwordValue.length >= 6,
        upper: /[A-Z]/.test(passwordValue),
        number: /[0-9]/.test(passwordValue),
    };
    const isPasswordValid =
        passwordChecks.length && passwordChecks.upper && passwordChecks.number;

    const update = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            showToast("Nama guru wajib diisi", "error");
            return;
        }

        if (!form.join_date) {
            showToast("Tanggal masuk wajib dipilih", "error");
            return;
        }

        if (!initialData && !form.username?.trim()) {
            showToast("Username login wajib diisi", "error");
            return;
        }

        if (!initialData && !form.password?.trim()) {
            showToast("Password login wajib diisi", "error");
            return;
        }
        if (!initialData && !isPasswordValid) {
            showToast(
                "Password minimal 6 karakter, mengandung huruf kapital & angka",
                "error"
            );
            return;
        }

        try {
            setLoading(true);
            if (onSubmit) {
                await onSubmit(form);
                onSuccess?.(initialData ? `Data ${form.name} berhasil diperbarui!` : `Guru ${form.name} berhasil ditambahkan!`);
            } else {
                await createGuru(form);
                showToast(`Guru ${form.name} berhasil ditambahkan!`, "success");
                setTimeout(() => router.push("/guru"), 1500);
            }
        } catch (error) {
            console.error("Gagal menyimpan guru:", error);
            showToast("Gagal menyimpan data guru", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let ignore = false;

        fetchRegions("provinces.json")
            .then((items) => {
                if (ignore) return;

                setProvinces(items);

                const provinceCode = items.find((item) =>
                    sameRegionName(item.name, initialData?.province)
                )?.code;

                if (provinceCode) {
                    setSelectedProvinceCode(provinceCode);
                }
            })
            .catch((error) => {
                console.error("Gagal mengambil provinsi:", error);
            });

        return () => {
            ignore = true;
        };
    }, [initialData?.province]);

    useEffect(() => {
        if (!selectedProvinceCode) return;

        let ignore = false;

        fetchRegions(`regencies/${selectedProvinceCode}.json`)
            .then((items) => {
                if (ignore) return;

                setRegencies(items);

                const regencyCode = items.find((item) =>
                    sameRegionName(item.name, initialData?.city)
                )?.code;

                if (regencyCode) {
                    setSelectedRegencyCode(regencyCode);
                }
            })
            .catch((error) => {
                console.error("Gagal mengambil kabupaten/kota:", error);
            });

        return () => {
            ignore = true;
        };
    }, [initialData?.city, selectedProvinceCode]);

    useEffect(() => {
        if (!selectedRegencyCode) return;

        let ignore = false;

        fetchRegions(`districts/${selectedRegencyCode}.json`)
            .then((items) => {
                if (ignore) return;

                setDistricts(items);

                const districtCode = items.find((item) =>
                    sameRegionName(item.name, initialData?.district)
                )?.code;

                if (districtCode) {
                    setSelectedDistrictCode(districtCode);
                }
            })
            .catch((error) => {
                console.error("Gagal mengambil kecamatan:", error);
            });

        return () => {
            ignore = true;
        };
    }, [initialData?.district, selectedRegencyCode]);

    useEffect(() => {
        if (!selectedDistrictCode) return;

        let ignore = false;

        fetchRegions(`villages/${selectedDistrictCode}.json`)
            .then((items) => {
                if (ignore) return;

                setVillages(items);
            })
            .catch((error) => {
                console.error("Gagal mengambil desa/kelurahan:", error);
            });

        return () => {
            ignore = true;
        };
    }, [selectedDistrictCode]);

    const handleProvinceChange = (code: string) => {
        const province = provinces.find((item) => item.code === code);

        setSelectedProvinceCode(code);
        setSelectedRegencyCode("");
        setSelectedDistrictCode("");
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        setForm((prev) => ({
            ...prev,
            province: province?.name || "",
            city: "",
            district: "",
            village: "",
        }));
    };

    const handleRegencyChange = (code: string) => {
        const regency = regencies.find((item) => item.code === code);

        setSelectedRegencyCode(code);
        setSelectedDistrictCode("");
        setDistricts([]);
        setVillages([]);
        setForm((prev) => ({
            ...prev,
            city: regency?.name || "",
            district: "",
            village: "",
        }));
    };

    const handleDistrictChange = (code: string) => {
        const district = districts.find((item) => item.code === code);

        setSelectedDistrictCode(code);
        setVillages([]);
        setForm((prev) => ({
            ...prev,
            district: district?.name || "",
            village: "",
        }));
    };

    const handleVillageChange = (code: string) => {
        const village = villages.find((item) => item.code === code);

        update("village", village?.name || "");
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
                                    setForm(prev => ({ ...prev, photo: file }));
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
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Kontak</Label>
                                <Input
                                    type="number"
                                    value={form.phone}
                                    placeholder="08123456789"
                                    onChange={(e) => update("phone", e.target.value)}
                                />
                            </div>
                        </div>

                        {!initialData && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label>Username Login</Label>
                                    <Input
                                        type="text"
                                        value={form.username || ""}
                                        placeholder="contoh: guru_ahmad"
                                        onChange={(e) => update("username", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>
                                        Email Login <span className="text-gray-400">(opsional)</span>
                                    </Label>
                                    <Input
                                        type="email"
                                        value={form.email || ""}
                                        placeholder="guru@email.com"
                                        onChange={(e) => update("email", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Password Login</Label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={form.password || ""}
                                            placeholder="Minimal 6 karakter"
                                            onChange={(e) => update("password", e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Indikator syarat password */}
                                    {form.password && (
                                        <ul className="mt-2 space-y-1 text-xs">
                                            <li className={passwordChecks.length ? "text-green-600" : "text-gray-400"}>
                                                {passwordChecks.length ? "✓" : "○"} Minimal 6 karakter
                                            </li>
                                            <li className={passwordChecks.upper ? "text-green-600" : "text-gray-400"}>
                                                {passwordChecks.upper ? "✓" : "○"} Mengandung huruf kapital (A-Z)
                                            </li>
                                            <li className={passwordChecks.number ? "text-green-600" : "text-gray-400"}>
                                                {passwordChecks.number ? "✓" : "○"} Mengandung angka (0-9)
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Induk Guru</Label>
                                <Input
                                    type="text"
                                    value={form.teacher_number || ""}
                                    placeholder="Masukkan induk guru"
                                    onChange={(e) => update("teacher_number", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Induk TPQ</Label>
                                <Input
                                    type="text"
                                    value={form.tpq_number || ""}
                                    placeholder="Masukkan induk TPQ"
                                    onChange={(e) => update("tpq_number", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Jenis Kelamin</Label>
                                <select
                                    value={form.gender || ""}
                                    onChange={(e) => update("gender", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                >
                                    <option value="">Pilih jenis kelamin</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <Label>Tempat Lahir</Label>
                                <Input
                                    type="text"
                                    value={form.birth_place || ""}
                                    placeholder="Contoh: Batam"
                                    onChange={(e) => update("birth_place", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DatePicker
                                id="tanggal-lahir-guru"
                                label="Tanggal Lahir"
                                placeholder="Pilih tanggal lahir"
                                defaultDate={form.birth_date || undefined}
                                onChange={(_, val) => update("birth_date", val)}
                            />
                        </div>

                        <div>
                            <Label>Alamat</Label>
                            <TextArea
                                value={form.address}
                                onChange={(e) => update("address", e)}
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Provinsi</Label>
                                <select
                                    value={selectedProvinceCode}
                                    onChange={(e) => handleProvinceChange(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                >
                                    <option value="">Pilih provinsi</option>
                                    {provinces.map((province) => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Kabupaten / Kota</Label>
                                <select
                                    value={selectedRegencyCode}
                                    disabled={!selectedProvinceCode}
                                    onChange={(e) => handleRegencyChange(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                >
                                    <option value="">
                                        {selectedProvinceCode ? "Pilih kabupaten / kota" : "Pilih provinsi dulu"}
                                    </option>
                                    {regencies.map((regency) => (
                                        <option key={regency.code} value={regency.code}>
                                            {regency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Kecamatan</Label>
                                <select
                                    value={selectedDistrictCode}
                                    disabled={!selectedRegencyCode}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                >
                                    <option value="">
                                        {selectedRegencyCode ? "Pilih kecamatan" : "Pilih kabupaten / kota dulu"}
                                    </option>
                                    {districts.map((district) => (
                                        <option key={district.code} value={district.code}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Desa / Kelurahan</Label>
                                <select
                                    value={villages.find((item) => sameRegionName(item.name, form.village))?.code || ""}
                                    disabled={!selectedDistrictCode}
                                    onChange={(e) => handleVillageChange(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                >
                                    <option value="">
                                        {selectedDistrictCode ? "Pilih desa / kelurahan" : "Pilih kecamatan dulu"}
                                    </option>
                                    {villages.map((village) => (
                                        <option key={village.code} value={village.code}>
                                            {village.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label>Syahadah Dari</Label>
                                <Input
                                    type="text"
                                    value={form.certificate_from || ""}
                                    onChange={(e) => update("certificate_from", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Nomor Syahadah</Label>
                                <Input
                                    type="text"
                                    value={form.certificate_number || ""}
                                    onChange={(e) => update("certificate_number", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Ijazah Terakhir</Label>
                                <Input
                                    type="text"
                                    value={form.education || ""}
                                    onChange={(e) => update("education", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DatePicker
                                id="tanggal-masuk"
                                label="Tanggal Masuk"
                                placeholder="Pilih tanggal masuk"
                                defaultDate={form.join_date || undefined}
                                onChange={(_, val) => update("join_date", val)}
                            />

                            {initialData && (
                                <DatePicker
                                    id="tanggal-keluar"
                                    label="Tanggal Keluar"
                                    placeholder="Opsional"
                                    defaultDate={form.leave_date || undefined}
                                    onChange={(_, val) => update("leave_date", val)}
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
