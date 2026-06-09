import * as Toast from "@radix-ui/react-toast";


const RadixToast = ({
	title,
	details,
	url,
	onCloseCallback
}: {
	title: string,
	details: string,
	url?: string,
	onCloseCallback?: () => void
}) => {
	return (
		<Toast.Provider swipeDirection="right" >
			<Toast.Root
			
				className="p-4 rounded-md bg-neutral-100 dark:bg-neutral-900 ring ring-neutral-200 dark:ring-neutral-800 shadow-xl shadow-neutral-300 dark:shadow-neutral-900"
				onOpenChange={() => onCloseCallback ? onCloseCallback() : {}}
			>
				<Toast.Title className="font-medium mb-1">{title}</Toast.Title>
				<div className="flex">
					<Toast.Description className="text-sm leading-[1.3] m-0 shrink">
						{details}
					</Toast.Description>

					<Toast.Action
					
						asChild
						altText="OK"
					>
						<button
							className="btn_1 reg text-sm">
							OK
						</button>
					</Toast.Action>
				</div>
			</Toast.Root>
			<Toast.Viewport className="fixed flex flex-col gap-2.5 w-[390px] max-w-[100vw] z-[2147483647] m-0 right-0 bottom-0 p-6" />
		</Toast.Provider>
	);
};



export default RadixToast;
