import { useNavigation } from "react-router"

export default function Spinner() {
    const { state } = useNavigation()
    return state !== "idle" && (
        <div className="fixed z-[444] l-0 t-0 w-screen h-screen transform translate-x-2/4 translate-y-2/4">
            <div className="spinner" />
        </div>
    )
}