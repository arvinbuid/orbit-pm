import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <div className="flex flex-1 flex-col h-screen">
                {/* Navbar */}
                <nav className="shadow-sm py-3 z-100 bg-white">
                    <div className="max-w-6xl h-full flex justify-between items-center mx-auto px-6 text-md">
                        <div>
                            <p className="select-none font-bold uppercase tracking-wide">Orbit<span className="text-blue-600">PM</span></p>
                        </div>
                        <div>
                            <ul className="flex items-center gap-4 hover:cursor-pointer text-sm">
                                <li onClick={() => navigate('/sign-in')}>Sign In</li>
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
                    <div className="relative md:absolute md:inset-0 max-w-7xl md:h-[90vh] mx-auto bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px]">
                        <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 mx-auto md:h-[90vh]">
                            {/* Left */}
                            <div className="flex items-center px-6 mt-9 md:mt-0">
                                <div className="space-y-5">
                                    <div className="inline-flex bg-white">
                                        <p className="flex items-center gap-3 border border-gray-300 shadow-sm rounded-full px-4 py-2 text-xs">
                                            <span className="bg-blue-600 w-2.5 h-2.5 rounded-full " />
                                            New Feature: Chat System
                                        </p>
                                    </div>
                                    <div className="space-y-3 pr-0 lg:pr-10 w-full">
                                        <h1 className="text-4xl lg:text-5xl font-bold leading-11 lg:leading-14 text-left">The Productivity App for
                                            Modern Teams
                                        </h1>
                                        <p>
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
                                    <div className="h-auto rounded-3xl overflow-hidden">
                                        <img src="images/hero-img.png" />
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