import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100 transition-colors">
            <div className="flex flex-1 flex-col min-h-screen">
                {/* Navbar */}
                <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 py-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
                    <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 text-md">
                        <div>
                            <p className="select-none font-bold uppercase tracking-wide text-slate-900 dark:text-white">Orbit<span className="text-blue-600">PM</span></p>
                        </div>
                        <div>
                            <ul className="flex items-center gap-4 text-sm text-slate-600 hover:cursor-pointer dark:text-slate-300">
                                <li
                                    onClick={() => navigate('/sign-in')}
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Sign In
                                </li>
                                <li
                                    onClick={() => navigate('/sign-up')}
                                    className="px-6 py-1.5 rounded-full bg-blue-600 text-slate-50 hover:bg-blue-700 transition-colors"
                                >
                                    Sign Up
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                {/* Hero */}
                <div className="w-full">
                    <div className="relative mx-auto max-w-9xl bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[46px_46px] dark:bg-zinc-950 dark:bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] md:absolute md:inset-0 md:h-[90vh]">
                        <div className="mx-auto grid max-w-6xl grid-cols-1 md:h-[90vh] md:grid-cols-2">
                            {/* Left */}
                            <div className="flex items-center px-6 mt-9 md:mt-0">
                                <div className="space-y-5">
                                    <div className="inline-flex rounded-full bg-white/80 dark:bg-zinc-900/80">
                                        <p className="flex items-center gap-3 rounded-full border border-gray-300 px-4 py-2 text-xs text-slate-700 shadow-sm dark:border-zinc-700 dark:text-slate-200">
                                            <span className="bg-blue-600 w-2.5 h-2.5 rounded-full " />
                                            New Feature: Chat System
                                        </p>
                                    </div>
                                    <div className="space-y-3 pr-0 lg:pr-10 w-full">
                                        <h1 className="text-left text-4xl font-bold leading-11 text-slate-900 dark:text-white lg:text-5xl lg:leading-14">The Productivity App for
                                            Modern Teams
                                        </h1>
                                        <p className="text-slate-600 dark:text-slate-300">
                                            Stop switching apps. Manage tasks, docs and goals in one
                                            unified workspace designed for speed.
                                        </p>
                                    </div>

                                    <div className="mt-4 lg:mt-6">
                                        <button
                                            onClick={() => navigate('/sign-in')}
                                            className="px-6 py-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                                        >
                                            Get Started
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Right */}
                            <div className="flex md:justify-center md:items-center px-6 md:px-4 mt-9 md:mt-0">
                                {/* <img src="images/hero-img.png" className="w-md" /> */}
                                <div>
                                    <div className="h-auto overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-300/40 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
                                        <img src="images/hero-img.png" className="block" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Home;
