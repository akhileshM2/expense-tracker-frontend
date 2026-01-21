import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Heading } from "../components/Heading"
import { SubHeading } from "../components/Subheading"
import { InputBox } from "../components/Inputbox"
import { Button } from "../components/Button"
import axios from "axios"
import { BottomWarning } from "../components/BottomWarning"

export const Signup = () => {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    return (<>
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col justify-center">
                <div className="rounded-lg bg-slate-300 w-80 text-center p-2 h-max px-4">
                    <Heading label={"Sign up"} />
                    <SubHeading label={"Enter information to create an account"}/>
                    <InputBox onChange={(e: any) => {
                        setName(e.target.value)
                    }} placeholder={"John Doe"} label={"Name"} />
                    <InputBox onChange={(e: any) => {
                        setEmail(e.target.value)
                    }} placeholder={"johndoe@gmail.com"} label={"Email"} />
                    <InputBox onChange={(e: any) => {
                        setPassword(e.target.value)
                    }} placeholder={"12345678"} label={"Password"} />

                    <div className="pt-4">
                        <Button loading={loading} label={"Sign up"} onClick={async () => {
                            setLoading(true)
                            const res = await axios.post("http://localhost:3000/api/v1/user/signup", {
                                name,
                                email,
                                password
                            })
                            localStorage.setItem("token", res.data.key)
                            localStorage.setItem("name", res.data.name)
                            localStorage.setItem("email", res.data.email)
                            navigate("/dashboard")
                            setLoading(false)
                        }}/>
                    </div>
                    <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/signin"}/>
                </div>
            </div>
        </div>
    </>)
}