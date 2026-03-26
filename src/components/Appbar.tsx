import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useEffect, useRef, useState } from "react"
import axios from "axios"

export const Appbar = () => {
    const initials = localStorage.getItem("name") || ""
    const arr = initials.split(" ")

    return (
        <div className="border-b flex justify-between px-10 py-6 bg-slate-200 shadow-md">
            <Link to={"/dashboard"} className="flex flex-col justify-center cursor-pointer">
                <div className="font-signature text-2xl text-gray-800">
                    Expense Tracker
                </div>
            </Link>
            <div>
                <Avatar size="big" name={arr.length === 1 ? arr[0][0].toUpperCase() : arr[0][0].toUpperCase() + arr[arr.length-1][0].toUpperCase()} />
            </div>
        </div>
    )
}

export function Avatar({ name, size = "small" }: { name: string, size?: "small" | "big" }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleAccountDelete = async () => {
        const confirmation = window.confirm("Are you sure? This will delete your account and all your expense history.")

        if (!confirmation) return

        const userId = localStorage.getItem("email")
        const id = localStorage.getItem("id")

        try {
            await axios.delete(`http://localhost:3000/api/v1/user/removeUser/user/${userId}/id/${id}`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            })
            navigate("/signin")
            alert("Account deleted successfully!!")
            logout()
        } catch (err) {
            console.error("Delete failed. Please recheck your data and try again.", err)
            alert("Error during deletion. Please try again after sometime")
        } finally {
            setIsOpen(false)
        }
    }

    const handleUpdate = async () => {
        setLoading(true)

        try {
            const token = localStorage.getItem("token")
            const userEmail = localStorage.getItem("email")
            if (newPassword !== confirmNewPassword) throw console.error()
            if (oldPassword === newPassword || oldPassword === confirmNewPassword) throw console.error()
            

            await axios.put("http://localhost:3000/api/v1/user/changePassword", {
                userId: userEmail,
                oldPassword,
                newPassword
            }, {
                headers: {
                    Authorization: token
                }
            })

            setOldPassword("")
            setNewPassword("")
            setConfirmNewPassword("")
            setIsEditModalOpen(false)
            alert("Password changed successfully!!")
        } catch (error) {
            console.error("Update failed", error)
            alert("Error during password change. Check your passwords and retry.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Clickable Avatar */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="focus:outline-none block"
            >
                <div className={`relative inline-flex items-center justify-center ${size === "small" ? "w-8 h-8" : "w-10 h-10"} overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600`}>
                    <span className={`font-xs text-gray-600 dark:text-gray-300 ${size === "small" ? "text-s" : "text-md"}`}>{name}</span>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <button
                        onClick={() => {
                            setIsEditModalOpen(true)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Change Password
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                        onClick={() => { navigate("/dashboard"); logout() }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Logout
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                        onClick={() => {
                            handleAccountDelete()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        Delete Account
                    </button>
                </div>
            )}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
                            <button onClick={() => {
                                setIsEditModalOpen(false)
                                setOldPassword("")
                                setNewPassword("")
                                setConfirmNewPassword("")
                                setIsOpen(false)
                                }} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Old Password</label>
                                <input
                                    type="password" 
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full mt-1 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full mt-1 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="w-full mt-1 p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => {
                                        setIsEditModalOpen(false)
                                        setIsOpen(false)
                                        setOldPassword("")
                                        setNewPassword("")
                                        setConfirmNewPassword("")
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
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}