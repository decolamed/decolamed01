export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-5"
      style={{
        background: "radial-gradient(1200px 700px at 50% -10%, #0e3a5c 0%, #0a2438 60%, #071a2a 100%)"
      }}
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
