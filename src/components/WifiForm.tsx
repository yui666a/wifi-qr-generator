import type { Encryption, WifiConfig } from "../lib/wifiPayload";

type Props = {
	value: WifiConfig;
	onChange: (next: WifiConfig) => void;
};

const ENCRYPTIONS: { value: Encryption; label: string }[] = [
	{ value: "WPA", label: "WPA / WPA2 / WPA3" },
	{ value: "WEP", label: "WEP" },
	{ value: "nopass", label: "暗号化なし" },
];

const labelClass = "block text-sm font-medium text-slate-700";
const inputClass =
	"mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base " +
	"focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

export function WifiForm({ value, onChange }: Props) {
	const update = (patch: Partial<WifiConfig>) => onChange({ ...value, ...patch });

	return (
		<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
			<div>
				<label className={labelClass} htmlFor="ssid">
					ネットワーク名（SSID）
				</label>
				<input
					id="ssid"
					className={inputClass}
					type="text"
					autoComplete="off"
					value={value.ssid}
					onChange={(e) => update({ ssid: e.target.value })}
				/>
			</div>

			<div>
				<label className={labelClass} htmlFor="encryption">
					暗号化方式
				</label>
				<select
					id="encryption"
					className={inputClass}
					value={value.encryption}
					onChange={(e) => update({ encryption: e.target.value as Encryption })}
				>
					{ENCRYPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			{value.encryption !== "nopass" && (
				<div>
					<label className={labelClass} htmlFor="password">
						パスワード
					</label>
					<input
						id="password"
						className={inputClass}
						type="text"
						autoComplete="off"
						value={value.password}
						onChange={(e) => update({ password: e.target.value })}
					/>
				</div>
			)}

			<label className="flex items-center gap-2 text-sm text-slate-700">
				<input
					type="checkbox"
					className="size-4 rounded border-slate-300"
					checked={value.hidden}
					onChange={(e) => update({ hidden: e.target.checked })}
				/>
				ステルス SSID（非公開ネットワーク）
			</label>
		</form>
	);
}
