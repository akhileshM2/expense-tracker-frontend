import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heading } from "../components/Heading"
import { SubHeading } from "../components/Subheading"
import { InputBox } from "../components/Inputbox"
import { Button } from "../components/Button"
import axios from "axios"
import { BottomWarning } from "../components/BottomWarning"
import { useAuth } from "../hooks/useAuth"

export const Signup = () => {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    return (<>
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col justify-center">
                <div className="rounded-lg bg-slate-300 w-80 text-center p-2 h-max px-4">
                    <Heading label={"Sign up"} />
                    <SubHeading label={"Enter information to create an account"}/>
                    <InputBox type={"name"} onChange={(e: any) => {
                        setName(e.target.value)
                    }} placeholder={"John Doe"} label={"Name"} />
                    <InputBox type={"email"} onChange={(e: any) => {
                        setEmail(e.target.value)
                    }} placeholder={"johndoe@gmail.com"} label={"Email"} />
                    <InputBox type={"password"} onChange={(e: any) => {
                        setPassword(e.target.value)
                    }} placeholder={"12345678"} label={"Password"} />

                    <div className="pt-4">
                        <Button loading={loading} label={"Sign up"} onClick={async () => {
                            setLoading(true)
                            try {
                                const res = await axios.post("https://api.expensetracker24.in/api/v1/user/signup", {
                                    name,
                                    email,
                                    password
                                })

                                const userData = {
                                    token: res.data.token,
                                    name: res.data.name,
                                    email: res.data.email,
                                    id: res.data.id
                                }
                                
                                login(userData)
                                navigate("/dashboard")
                            } catch (err) {
                                console.error(err)
                                setError(true)
                            } finally {
                                setLoading(false)
                            }
                        }}/>
                    </div>
                    <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/signin"}/>
                    {error ? ( <div className="text-red-600 font-semibold">Invalid name, email or password</div> ) : ("")}
                </div>
            </div>
        </div>
    </>)
}