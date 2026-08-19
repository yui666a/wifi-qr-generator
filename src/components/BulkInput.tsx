import { PER_PAGE_CHOICES } from "../lib/paperLayout";
import type { ParseResult } from "../lib/parseWifiCsv";

type Props = {
	text: string;
	onTextChange: (next: string) => void;
	result: ParseResult;
	perPage: number;
	autoPerPage: number;
	onPerPageChange: (next: number | null) => void;
	isAuto: boolean;
	pageCount: number;
};

const SAMPLE = [
	"ssid,password,label",
	"regate_kaigi,regate2023!,地下",
	"1F-1_5G,KG4vNI95,1階",
	"FreeSpot,,ロビー,nopass",
].join("\n");

export function BulkInput({
	text,
	onTextChange,
	result,
	perPage,
	autoPerPage,
	onPerPageChange,
	isAuto,
	pageCount,
}: Props) {
	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-slate-700" htmlFor="bulk">
					CSV / TSV を貼り付け
				</label>
				<p className="mt-1 text-xs text-slate-500">
					1 行目は列名。<code>ssid</code> は必須、<code>password</code> / <code>label</code> /{" "}
					<code>encryption</code> は任意です。
				</p>
				<textarea
					id="bulk"
					className="mt-2 h-48 w-full rounded-md border border-slate-300 bg-white p-3 font-mono text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
					placeholder={SAMPLE}
					value={text}
					onChange={(event) => onTextChange(event.target.value)}
				/>
			</div>

			{result.errors.length > 0 && (
				<ul className="space-y-1 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
					{result.errors.map((error) => (
						<li key={`${error.line}-${error.message}`}>
							{error.line} 行目: {error.message}
						</li>
					))}
				</ul>
			)}

			{result.entries.length > 0 && (
				<>
					<div className="flex flex-wrap items-center gap-3">
						<label className="text-sm font-medium text-slate-700" htmlFor="per-page">
							1 枚あたり
						</label>
						<select
							id="per-page"
							className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
							value={isAuto ? "auto" : String(perPage)}
							onChange={(event) =>
								onPerPageChange(event.target.value === "auto" ? null : Number(event.target.value))
							}
						>
							<option value="auto">自動（{autoPerPage} 枚）</option>
							{PER_PAGE_CHOICES.map((choice) => (
								<option key={choice.perPage} value={choice.perPage}>
									{choice.label}
								</option>
							))}
						</select>
						<span className="text-sm text-slate-600">
							{result.entries.length} 件 → A4 {pageCount} 枚
						</span>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="border-b border-slate-200 text-slate-600">
								<tr>
									<th className="py-1 pr-3 font-medium">ラベル</th>
									<th className="py-1 pr-3 font-medium">SSID</th>
									<th className="py-1 pr-3 font-medium">パスワード</th>
									<th className="py-1 font-medium">暗号化</th>
								</tr>
							</thead>
							<tbody className="font-mono">
								{result.entries.map((entry) => (
									<tr key={`${entry.label}-${entry.ssid}`} className="border-b border-slate-100">
										<td className="py-1 pr-3">{entry.label}</td>
										<td className="py-1 pr-3 break-all">{entry.ssid}</td>
										<td className="py-1 pr-3 break-all">{entry.password}</td>
										<td className="py-1">{entry.encryption}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
}
