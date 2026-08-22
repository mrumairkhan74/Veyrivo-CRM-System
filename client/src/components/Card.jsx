const Card = ({ title, description, icon }) => {
    return (
        <div className="flex h-[280px] w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
            
            {/* Icon */}
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                {icon}
            </div>

            {/* Content */}
            <h3 className="mb-3 text-xl font-semibold text-[#0B1220]">
                {title}
            </h3>

            <p className="leading-relaxed text-slate-500">
                {description}
            </p>
        </div>
    );
};

export default Card;