export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">LaundryFlow</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Digital laundry register: students submit, staff verify, fines are
        calculated automatically.
      </p>
      <p className="font-mono text-sm text-zinc-500">
        Starter page. Replace it with the landing / login screen.
      </p>
    </main>
  );
}
