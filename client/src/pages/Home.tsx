const Home = () => {
    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <div className="flex flex-1 flex-col h-screen">
                {/* Navbar */}
                <nav className="h-16 shadow-sm">
                    <div className="max-w-6xl h-full flex justify-between items-center mx-auto px-6 text-md">
                        <div>
                            <p className="select-none font-semibold uppercase tracking-wide">Orbit<span className="text-blue-600">PM</span></p>
                        </div>
                        <div>
                            <ul className="flex items-center gap-4 hover:cursor-pointer text-sm">
                                <li>Sign In</li>
                                <li className="px-6 py-1.5 rounded-full bg-blue-600 text-slate-50 hover:bg-blue-700 transition-colors">Sign Up</li>
                            </ul>
                        </div>
                    </div>
                </nav>
                {/* Hero */}
                <div>
                    <div className="max-w-6xl grid grid-cols-2 mx-auto h-[90vh]">
                        {/* Left */}
                        <div className="flex mt-[20vh] px-4">
                            <div className="space-y-5">
                                <div className="inline-flex">
                                    <p className="flex items-center gap-3 border border-gray-300 shadow-sm rounded-full px-4 py-2 text-xs">
                                        <span className="bg-blue-600 w-2.5 h-2.5 rounded-full " />
                                        New Feature: Chat System
                                    </p>
                                </div>
                                <h1 className="text-5xl font-bold leading-14">The Productivity App for
                                    Modern Teams
                                </h1>
                                <p>
                                    Stop switching apps. Manage tasks, docs and goals in one
                                    unified workspace designed for speed.
                                </p>
                                <div className="mt-8">
                                    <button className="px-6 py-2 bg-blue-600 rounded-full text-white">Get Started</button>
                                </div>
                            </div>
                        </div>
                        {/* Right */}
                        <div className="flex justify-center items-center">
                            {/* <img src="images/hero-img.png" className="w-md" /> */}
                            <div className="h-auto bg-blue-500 rounded-3xl overflow-hidden">
                                <img src="images/hero-img.png" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;