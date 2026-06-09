"use client";

import { useEffect, useState, useRef } from "react";
import { createSantri } from "@/services/santri";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import { ChevronDownIcon } from "@/icons";
import { useRouter } from "next/navigation";
import { Santri, SantriFormData } from "@/types/santri";
import { getKelas } from "@/services/kelas";
import { Kelas } from "@/types/kelas";

type Props = {
    initialData?: Santri;
    onSubmit?: (data: SantriFormData) => Promise<void>;
    onSuccess?: (message: string) => void;
};

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

export default function SantriForm({ initialData, onSubmit, onSuccess }: Props) {
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const frameRef = useRef<HTMLDivElement>(null);
    const [preview, setPreview] = useState<string | null>(
        initialData?.photo
            ? `http://127.0.0.1:8000/storage/${initialData.photo}`
            : null
    );

    const [kelasList, setKelasList] = useState<Kelas[]>([]);
    const [provinces, setProvinces] = useState<RegionOption[]>([]);
    const [regencies, setRegencies] = useState<RegionOption[]>([]);
    const [districts, setDistricts] = useState<RegionOption[]>([]);
    const [villages, setVillages] = useState<RegionOption[]>([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
    const [selectedRegencyCode, setSelectedRegencyCode] = useState("");
    const [selectedDistrictCode, setSelectedDistrictCode] = useState("");

    useEffect(() => {
        getKelas()
            .then((data) => {
                setKelasList(data.filter((item: Kelas) => item.status === "active"));
            })
            .catch(console.error);
    }, []);

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
        study_class_id: initialData?.study_class_id || "",

        student_number: initialData?.student_number || "",
        tpq_number: initialData?.tpq_number || "",

        name: initialData?.name || "",

        nisn: initialData?.nisn || "",
        nik: initialData?.nik || "",
        family_card_number: initialData?.family_card_number || "",

        gender: initialData?.gender || "",

        birth_place: initialData?.birth_place || "",
        birth_date: initialData?.birth_date || "",

        child_order: initialData?.child_order || "",
        siblings_count: initialData?.siblings_count || "",

        father_name: initialData?.father_name || "",
        mother_name: initialData?.mother_name || "",
        contact_guardian: initialData?.contact_guardian || "",

        hamlet: initialData?.hamlet || "",
        village: initialData?.village || "",
        district: initialData?.district || "",
        city: initialData?.city || "",
        province: initialData?.province || "",

        formal_school: initialData?.formal_school || "",
        formal_class: initialData?.formal_class || "",
        npsn: initialData?.npsn || "",

        student_type: initialData?.student_type || "regular",

        status: initialData?.status || "pending",

        photo: null,
        family_card_file: null,
        birth_certificate_file: null,
    });

    const [loading, setLoading] = useState(false);

    const genderOptions = [
        { value: "male", label: "Laki-Laki" },
        { value: "female", label: "Perempuan" },
    ];

    const jenisSantriOptions = [
        { value: "regular", label: "Santri Biasa" },
        { value: "pre_qiraati", label: "Pra PTPT" },
        { value: "qiraati", label: "PTPT / Qiraati" },
    ];

    const statusOptions = [
        { value: "pending", label: "Pending" },
        { value: "active", label: "Aktif" },
        { value: "graduated", label: "Lulus" },
        { value: "left", label: "Keluar" },
    ];

    const update = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            showToast("Nama santri wajib diisi", "error");
            return;
        }

        if (!form.gender) {
            showToast("Jenis kelamin wajib dipilih", "error");
            return;
        }

        if (!form.birth_date) {
            showToast("Tanggal lahir wajib diisi", "error");
            return;
        }

        if (!form.student_type) {
            showToast("Jenis santri wajib dipilih", "error");
            return;
        }

        try {
            setLoading(true);

            if (onSubmit) {
                await onSubmit(form);

                onSuccess?.(
                    initialData
                        ? `Data ${form.name} berhasil diperbarui!`
                        : `Santri ${form.name} berhasil ditambahkan!`
                );
            } else {
                await createSantri(form);

                showToast(
                    `Santri ${form.name} berhasil ditambahkan!`,
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

                    {/* Form Santri */}
                    <div className="w-full flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Kelas</Label>
                                <select
                                    value={form.study_class_id || ""}
                                    onChange={(e) => update("study_class_id", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                >
                                    <option value="">Pilih kelas</option>
                                    {kelasList.map((kelas) => (
                                        <option key={kelas.id} value={kelas.id}>
                                            {kelas.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>Jenis Santri <span className="text-error-500">*</span></Label>
                                <div className="relative">
                                    <Select
                                        options={jenisSantriOptions}
                                        defaultValue={form.student_type}
                                        placeholder="Pilih jenis santri"
                                        onChange={(value) => update("student_type", value)}
                                    />
                                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                        <ChevronDownIcon />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Nama Santri <span className="text-error-500">*</span></Label>
                                <Input
                                    type="text"
                                    value={form.name}
                                    placeholder="Masukkan nama santri"
                                    onChange={(e) => update("name", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Jenis Kelamin <span className="text-error-500">*</span></Label>
                                <div className="relative">
                                    <Select
                                        options={genderOptions}
                                        defaultValue={form.gender}
                                        placeholder="Pilih jenis kelamin"
                                        onChange={(value) => update("gender", value)}
                                        className="dark:bg-dark-900"
                                    />
                                    <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                        <ChevronDownIcon />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Tempat Lahir</Label>
                                <Input
                                    type="text"
                                    value={form.birth_place || ""}
                                    placeholder="Contoh: Batam"
                                    onChange={(e) => update("birth_place", e.target.value)}
                                />
                            </div>

                            <DatePicker
                                id="tanggal-lahir"
                                label="Tanggal Lahir"
                                placeholder="Pilih tanggal lahir"
                                defaultDate={form.birth_date}
                                onChange={(_, currentDateString) => {
                                    update("birth_date", currentDateString);
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Induk Santri</Label>
                                <Input
                                    type="text"
                                    value={form.student_number || ""}
                                    placeholder="Masukkan induk santri"
                                    onChange={(e) => update("student_number", e.target.value)}
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label>NISN</Label>
                                <Input
                                    type="text"
                                    value={form.nisn || ""}
                                    placeholder="Masukkan NISN"
                                    onChange={(e) => update("nisn", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>NIK</Label>
                                <Input
                                    type="text"
                                    value={form.nik || ""}
                                    placeholder="Masukkan NIK"
                                    onChange={(e) => update("nik", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>No KK</Label>
                                <Input
                                    type="text"
                                    value={form.family_card_number || ""}
                                    placeholder="Masukkan nomor KK"
                                    onChange={(e) => update("family_card_number", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Upload KK</Label>
                                <Input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            kk: e.target.files?.[0] ?? null,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <Label>Upload Akte</Label>
                                <Input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            akte: e.target.files?.[0] ?? null,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Anak Ke</Label>
                                <Input
                                    type="number"
                                    value={String(form.child_order || "")}
                                    placeholder="Contoh: 1"
                                    onChange={(e) => update("child_order", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Jumlah Saudara</Label>
                                <Input
                                    type="number"
                                    value={String(form.siblings_count || "")}
                                    placeholder="Contoh: 3"
                                    onChange={(e) => update("siblings_count", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Nama Ayah</Label>
                                <Input
                                    type="text"
                                    value={form.father_name || ""}
                                    placeholder="Masukkan nama ayah"
                                    onChange={(e) => update("father_name", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Nama Ibu</Label>
                                <Input
                                    type="text"
                                    value={form.mother_name || ""}
                                    placeholder="Masukkan nama ibu"
                                    onChange={(e) => update("mother_name", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Kontak Wali <span className="text-error-500">*</span></Label>
                                <Input
                                    type="text"
                                    value={form.contact_guardian || ""}
                                    placeholder="08123456789"
                                    onChange={(e) => update("contact_guardian", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label>Dusun / Jalan</Label>
                                <Input
                                    type="text"
                                    value={form.hamlet || ""}
                                    placeholder="Masukkan dusun atau jalan"
                                    onChange={(e) => update("hamlet", e.target.value)}
                                />
                            </div>
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
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${form.status === "active" ? "bg-green-100 text-green-700" :
                                        form.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                            form.status === "graduated" ? "bg-blue-100 text-blue-700" :
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
