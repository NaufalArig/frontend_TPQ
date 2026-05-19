export default function SidebarWidget() {
    return (
        <div
            className={`
        mx-auto mt-10 w-full max-w-60 rounded-2xl bg-brand-500 px-4 py-5 text-center`}
        >
            <video src="/video/video-01.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-60 rounded-xl" />
        </div>
    );
}
