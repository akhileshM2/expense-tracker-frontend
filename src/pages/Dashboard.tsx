import { useCallback, useEffect, useRef, useState } from "react"
import { Appbar } from "../components/Appbar"
import axios from "axios"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "../datepicker-custom.css"
import { ChevronDown } from 'lucide-react'

interface Item {
    id: number
    item: string
    cost: number
}

export const Dashboard = () => {
    const [itemName, setItemName] = useState("")
    const [amount, setAmount] = useState("")
    const [amountType, setAmountType] = useState("Expenses")
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [buttonText, setButtonText] = useState(false)
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [editId, setEditId] = useState<number>(0)
    const [tempName, setTempName] = useState<string>("")
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState<Item | null>(null)
    const [activeTab, setActiveTab] = useState("Expenses")
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showPicker, setShowPicker] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const types = ["Savings", "Expenses", "Investments"]

    useEffect(() => {
        const fetchMonthlyData = async () => {
            const month = selectedDate.getMonth() + 1
            const year = selectedDate.getFullYear()
            const type = activeTab.toLowerCase()

            try {
                const response = await axios.get("http://localhost:3000/api/v1/account/monthly-summary", {
                    params: { month, year, type },
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                })
                setItems(response.data || [])
            } catch (err) {
                console.error("Failed to fetch data for selected month", err)
            }
        }
        fetchMonthlyData()
    }, [selectedDate])

    const toggleItemSelection = (id: number) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    const handleClick = () => {
        setButtonText(!buttonText)
        setSelectedItems([])
    }

    const fetchExpenses = useCallback(async (type = "expenses") => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/account/items/${type}`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            setItems(response.data.items || [])
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false)
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addItem = async () => {
        if (!itemName || !amount) return
        setLoading(true)
        setActiveTab(amountType)
        
        try {
            await axios.post("http://localhost:3000/api/v1/account/additem", {
                item: itemName,
                cost: parseInt(amount),
                type: amountType.toLowerCase(),
                userId: localStorage.getItem("email")
            }, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            })

            await fetchExpenses(amountType.toLowerCase())
            setItemName("")
            setAmount("")
        } catch (err) {
            console.error("Error adding items: ", err)
        }
    }

    const handleDeleteRequest = async () => {
        if (selectedItems.length === 0) return

        const confirmDelete = window.confirm(`Delete ${selectedItems.length} items?`)
        if (!confirmDelete) return

        const userId = localStorage.getItem("email")
        setLoading(true)

        try {
            const deleteRequests = selectedItems.map((id) => 
                axios.delete(`http://localhost:3000/api/v1/account/removeitem/user/${userId}/items/${id}`, {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                })
            )

            await Promise.all(deleteRequests)

            await fetchExpenses(activeTab.toLowerCase())
            setSelectedItems([])
            setLoading(false)
            setButtonText(false)
        } catch (error) {
            console.error("Delete failed:", error)
            alert("Some items could not be deleted.")
        } finally {
            alert("Item(s) deleted successfully!")
            setLoading(false)
            setButtonText(false)
        }
    }

    const openEditModal = (expense: Item) => {
        setSelectedExpense(expense)
        setEditId(expense.id)
        setItemName(expense.item)
        setTempName(expense.item)
        setAmount(expense.cost.toString())
        setIsEditModalOpen(true)
    }

    const handleUpdate = async () => {
        if (!selectedExpense || !itemName || !amount) return
        setLoading(true);

        try {
            const token = localStorage.getItem("token")
            const userEmail = localStorage.getItem("email")

            await axios.put("http://localhost:3000/api/v1/account/changeitem", {
                newItemName: itemName,
                cost: Number(amount),
                email: userEmail,
                id: editId,
                item: tempName

            }, {
                headers: {
                    Authorization: token
                }
            });

            await fetchExpenses(activeTab.toLowerCase())
            setEditId(0)
            setTempName("")
            setIsEditModalOpen(false)
            setSelectedExpense(null)
            setItemName("")
            setAmount("")
        } catch (error) {
            console.error("Update failed", error)
        } finally {
            setLoading(false);
        }
    }

    
    const tabs = ["Savings", "Expenses", "Investments"]

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        const time = new Date()
        if (time.getMonth() === selectedDate.getMonth()) {
            console.log(time.getMonth(), selectedDate.getMonth())
            fetchExpenses(tab.toLowerCase())
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="min-h-screen bg-slate-50">
            <Appbar />
            <div className="flex flex-col lg:flex-row justify-center gap-10 p-10">
                
                {/* Left Card: Input */}
                <div className="rounded-2xl bg-white w-full max-w-lg p-8 h-max shadow-lg border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Expense</h2>
                    <div className="space-y-4 text-left">
                        <div className="relative" ref={dropdownRef}>
                            <label className="text-sm font-semibold text-gray-500 ml-1">AMOUNT TYPE</label>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-4 transition-all focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {amountType}
                                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                    {types.map((type) => (
                                        <div
                                            key={type}
                                            onClick={() => {
                                                setAmountType(type);
                                                setIsOpen(false);
                                            }}
                                            className="px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                                            >
                                            {type}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 ml-1">ITEM NAME</label>
                            <input
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                placeholder="What did you buy?"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-500 ml-1">AMOUNT</label>
                            <input 
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                placeholder="0.00"
                            />
                        </div>
                        <button
                            onClick={addItem} disabled={loading}
                            type="submit"
                            className={`w-full text-white py-3 bg-blue-600 rounded-xl transition-all font-bold shadow-blue-200 shadow-md mt-4
                                ${loading 
                                ? "bg-blue-400 cursor-not-allowed" 
                                : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-200"
                            }`}
                        >
                            {loading ? (
                                <div role="status">
                                    <svg aria-hidden="true" className="mr-2 inline w-5 h-5 text-gray-200 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path className="opacity-50" d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                    </svg>
                                    Updating...
                                </div>
                            ) : (
                                "Add to Summary"
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Card: Summary List */}
                <div className="rounded-2xl bg-white w-full max-w-lg p-8 min-h-[450px] shadow-lg border border-gray-100 flex flex-col">
                    <div className="flex flex-col md:flex-row md:justify-between mb-3 border-b pb-2">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-bold text-gray-800">History</h2>
                            <div className="relative">
                                <button className="pl-4 text-gray-400 hover:text-blue-700 pt-1" onClick={() => setShowPicker(!showPicker)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                    </svg>
                                </button>
                                {showPicker && (
                                    <div className="absolute right-1 md:left-1 z-[100] mt-2">
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={(date: Date | null) => {
                                                if (date) {
                                                    setSelectedDate(date)
                                                    setShowPicker(false)
                                                }
                                            }}
                                            dateFormat="MM/yyyy"
                                            showMonthYearPicker
                                            inline
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        
                        <div className="md:flex-row md:justify-end items-center mb-6 mt-4 md:mt-0">
                            <button onClick={handleDeleteRequest} disabled={!selectedItems.length || loading} className={`text-white bg-red-400 px-3 py-1 rounded-full text-sm font-semibold shadow-blue-200 shadow-md mr-4
                                ${!selectedItems.length || loading
                                ? "bg-red-400 cursor-not-allowed" 
                                : "bg-red-600 hover:bg-red-800 active:scale-95 text-white shadow-red-200"
                            }`}>
                                {selectedItems.length && loading ? (
                                    <div role="status">
                                        <svg aria-hidden="true" className="mr-2 inline w-4 h-4 text-gray-200 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path className="opacity-50" d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                        </svg>
                                        Deleting...
                                    </div>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                            <button onClick={handleClick} className={`text-white px-3 py-1 rounded-full text-sm font-semibold shadow-blue-200 shadow-md mr-4
                                ${items.length 
                                    ? "bg-blue-600 hover:bg-blue-800"
                                    : "bg-blue-400 cursor-not-allowed"}`}
                                    >{buttonText ? "Cancel" : "Select"}</button>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                                {items.length === 0 ? `NO ITEMS` : items.length === 1 ? `1 ITEM` : `${items.length} ITEMS`}
                            </span>
                        </div>
                    </div>

                    <div className="w-full max-w-md mx-auto">
                        {/* Container for Tabs */}
                        <div className="relative flex justify-around mb-4 border-b border-gray-100 pb-2">
                            
                            {tabs.map((tab) => (
                                <div
                                    key={tab}
                                    onClick={() => handleTabClick(tab)}
                                    className={`flex-1 text-center text-sm font-semibold cursor-pointer transition-colors duration-300 ${
                                    activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-gray-700"
                                    }`}
                                >
                                    {tab}
                                </div>
                            ))}

                            {/* The Animated Underline */}
                            <div 
                                className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-in-out"
                                style={{ 
                                    width: "90px", 
                                    left: `calc(${(tabs.indexOf(activeTab) * 100 / tabs.length) + (100 / tabs.length / 2)}% - 45px)` 
                                }}
                            />
                        </div>
                    </div>
                    
                    
                    <div className="flex-grow space-y-3 overflow-y-auto max-h-[300px]">
                        {loading ? (
                            <p className="text-center text-gray-400 py-10">Fetching items...</p>
                        ) : items.length === 0 ? (
                            <p className="text-center text-gray-400 py-10 italic">No data found.</p>
                        ) : (
                            items.map((exp) => (
                                <div className={`flex justify-between items-center bg-gray-50 p-4 rounded-xl border ${
                                                selectedItems.includes(exp.id) ? "border-blue-500 bg-blue-50/30" : "border-gray-100"
                                            }`}>
                                    <div className="flex">
                                        <div key={exp.id}>
                                            {buttonText && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(exp.id)}
                                                    onChange={() => toggleItemSelection(exp.id)}
                                                    className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer mr-2"
                                                />
                                            )}
                                        </div>
                                        <span className="font-bold text-gray-900 uppercase">{exp.item}</span>
                                        <button onClick={() => openEditModal(exp)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-2 mt-1 text-gray-400 hover:text-gray-800 cursor-pointer">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </button>
                                    </div>
                                    <span className="font-semibold text-gray-700">₹{exp.cost.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-gray-400 font-bold text-sm uppercase">Total</span>
                        <span className="text-3xl font-black text-blue-600">
                            ₹{items.reduce((acc, curr) => acc + (curr.cost || 0), 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Edit Expense</h2>
                            <button onClick={() => {
                                setIsEditModalOpen(false)
                                setItemName("")
                                setAmount("")
                                }} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</label>
                                <input 
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    className="w-full mt-1 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount (₹)</label>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full mt-1 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => {
                                        setIsEditModalOpen(false)
                                        setItemName("")
                                        setAmount("")
                                    }}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}