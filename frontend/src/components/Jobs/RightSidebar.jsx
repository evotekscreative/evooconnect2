export default function RightSidebar({ activeTab }) {
    const items = activeTab === "job" ? 
        [
            {
                title: "Product Director",
                company: "Spotify Inc.",
                location: "India, Punjab",
                logo: "https://cdn-icons-png.flaticon.com/512/174/174872.png"
            }, 
            {
                title: ".NET Developer",
                company: "Invision",
                location: "London, UK",
                logo: "https://cdn-icons-png.flaticon.com/512/174/174881.png"
            }
        ] : 
        [
            {
                name: "Google",
                industry: "Technology",
                jobs: 42,
                logo: "https://cdn-icons-png.flaticon.com/512/281/281760.png"
            }, 
            {
                name: "Microsoft",
                industry: "Software",
                jobs: 35,
                logo: "https://cdn-icons-png.flaticon.com/512/732/732221.png"
            }
        ];

    return (
        <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-md">
                <h3 className="font-semibold mb-1">Because you viewed</h3>
                <p className="text-sm text-gray-500 mb-4">
                    {activeTab === "job" ? "Designer at Google?" : "Tech companies in your area"}
                </p>

                {items.map((item, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 mb-4 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{activeTab === "job" ? item.title : item.name}</p>
                                {activeTab === "job" ? (
                                    <>
                                        <p className="text-sm text-[#0A66C2]">{item.company}</p>
                                        <p className="text-sm text-gray-500">{item.location}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-500">{item.industry}</p>
                                        <p className="text-sm text-[#0A66C2]">{item.jobs} open jobs</p>
                                    </>
                                )}
                            </div>
                            <img src={item.logo} alt="logo" className="w-8 h-8" />
                        </div>
                        <div className="flex items-center mt-2 space-x-2">
                            <div className="flex -space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <img key={i} src="https://via.placeholder.com/20" className="rounded-full border" alt="profile" />
                                ))}
                            </div>
                            <p className="text-sm text-gray-600">18 connections</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Posted 3 Days ago</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-semibold mb-2">People you might know</h3>
                <div className="flex items-center space-x-3">
                    <img src="https://via.placeholder.com/40" alt="Profile" className="rounded-full" />
                    <div className="flex-1">
                        <p className="font-medium text-sm">Nama</p>
                        <p className="text-xs text-gray-500">Student at Harvard</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}