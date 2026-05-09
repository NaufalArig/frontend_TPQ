export default function UnauthorizedPage() {
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-red-500">
                🚫 Akses Ditolak
            </h1>
            <p className="text-gray-500 mt-2">
                Kamu tidak memiliki izin untuk membuka halaman ini
            </p>
        </div>
    );
}