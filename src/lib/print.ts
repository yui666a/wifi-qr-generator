// クリックハンドラから同期的に window.print() を呼ぶと、直前の状態変更が
// 反映される前にプレビューが確定することがある。レイアウトの確定を 2 フレーム
// 待ってから印刷する
export function printPage(): void {
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			window.print();
		});
	});
}
