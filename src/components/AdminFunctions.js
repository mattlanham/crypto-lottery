export default function AdminFunctions({ onClickCallback }) {
    return (
        <>
            <p className="mt-10">Admin functions:</p>
            <button className="hover:bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-10 text-lg text-black p-3 pl-5 pr-5 rounded-lg mt-5" onClick={() => { onClickCallback('startDraw') }}>
                Start Draw
            </button>
            
            <button  className="hover:bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-10 text-lg text-black p-3 pl-5 pr-5 rounded-lg mt-5 ml-10" onClick={() => { onClickCallback('withdrawBalance') }}>
                Withdraw contract balance
            </button>

            <button  className="hover:bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-10 text-lg text-black p-3 pl-5 pr-5 rounded-lg mt-5 ml-10" onClick={() => { onClickCallback('resetTickets') }}>
                Reset tickets
            </button>

            <button  className="hover:bg-gray-100 shadow-lg ring-1 ring-black ring-opacity-10 text-lg text-black p-3 pl-5 pr-5 rounded-lg mt-5 ml-10" onClick={() => { onClickCallback('setTicketPrice') }}>
                Set ticket price
            </button>
        </>
    )
}