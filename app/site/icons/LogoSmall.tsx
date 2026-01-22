export default function LogoSmall({ ...props }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="120" height="120" viewBox="0 0 16 16" fill="currentColor"
            clipRule="evenodd" fillRule="evenodd"
            {...props}>
            <rect height={6} width={6} x={1} y={1} rx={1} />
            <rect height={6} width={6} x={1} y={9} rx={1} />
            <rect height={6} width={6} x={9} y={9} rx={1} />
            <rect height={6} width={6} x={9} y={1} rx={1} />
        </svg>
    )
}