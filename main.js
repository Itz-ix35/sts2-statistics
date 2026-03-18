async function loadCards() {
	const cn = await fetch('/data/CN.json').then(res => res.text());
	const en = await fetch('/data/EN.json').then(res => res.text());
	const info = await fetch('/data/cards.json').then(res => res.text());

	return [JSON.parse(cn), JSON.parse(en), JSON.parse(info)];
}

async function loadRunFiles() {
	const list = await fetch('/runs/runs.json').then(res => res.json());

	const results = await Promise.all(
		list.map(async (file) => {
			const content = await fetch(`/runs/${file}`).then(res => res.text());
			return JSON.parse(content);
		})
	);

	return results;
}

const characters = {
	"CHARACTER.IRONCLAD": "战士",
	"CHARACTER.SILENT": "猎人",
	"CHARACTER.REGENT": "储君",
	"CHARACTER.NECROBINDER": "亡灵",
	"CHARACTER.DEFECT": "机器人",
}

const charactersInCardInfo = {
	"ironclad": "战士",
	"silent": "猎人",
	"regent": "储君",
	"necrobinder": "亡灵",
	"defect": "机器人",
	"colorless": "无色",
}

const rarityList = {
	"common": "普通",
	"uncommon": "稀有",
	"rare": "罕见",
	"ancient": "先古",
	"status": "状态",
	"curse": "诅咒",
	"quest": "任务",
	"token": "标记",
	"event": "事件",
	"basic": "基础",
}

const rarityColor = {
	"common": "#D8D8D8",
	"uncommon": "#7EDDF0",
	"rare": "#F2BE56",
	"ancient": "#FFFFFF",
	"status": "#FFFFFF",
	"curse": "#F382E8",
	"quest": "#FFFFFF",
	"token": "#FFFFFF",
	"event": "#82F391",
	"basic": "#C1C1C1",
}

let cachedcards = null;
let cacheddata = null;
const checkbox1 = document.getElementById('check1');
const checkbox2 = document.getElementById('check2');
checkbox1.addEventListener('change', () => {
	if (cachedcards && cacheddata) {renderTables(cachedcards, cacheddata);}
});
checkbox2.addEventListener('change', () => {
	if (cachedcards && cacheddata) {renderTables(cachedcards, cacheddata);}
});

loadCards().then(cards => {
loadRunFiles().then(data => {
	renderTables(cards, data);
	cachedcards = cards;
	cacheddata = data;
});
});

function renderTables(cards, data) {
	const cntContainer = document.getElementById('cntCard');
	cntContainer.innerHTML = '';
	const checked1 = document.getElementById('check1').checked;
	const checked2 = document.getElementById('check2').checked;
	cardNamesCN = cards[0];
	cardNamesEN = cards[1];
	cardInfo = cards[2];
	const raritySet = new Set(cardInfo.map(item => item.class));
	const charSet = new Set(cardInfo.map(item => item.character));
	for (const char in characters) {
		const freq = {};
		const encounterFreq = [{}, {}, {}];
		const chooseFreq = [{}, {}, {}];
		const cardSet = new Set();
		let runsCnt = 0;
		let cardsCnt = 0;

		for (const run of data) {
			const map = run.map_point_history;
			const player = run.players[0];
			if (checked1 && !run.win) continue;
			if (checked2 && run.ascension != 10) continue;
			if (run.players.length > 1) continue;
			if (player.character !== char) continue;

			runsCnt++;
			cardsCnt += player.deck.length;
			for (const card of player.deck) {
				freq[card.id] = (freq[card.id] || 0) + 1;
				cardSet.add(card.id);
			}
			for (const [layerID, encounter] of Object.entries(map)) {
				for (const room of encounter) {
					const roomName = room.rooms[0].model_id || "";
					const cardChoices = room.player_stats[0].card_choices || [];
					if (!roomName.startsWith("ENCOUNTER")) {continue;}
					for (const cardChoice of cardChoices) {
						encounterFreq[layerID][cardChoice.card.id] = (encounterFreq[layerID][cardChoice.card.id] || 0) + 1;
						if (cardChoice.was_picked) {chooseFreq[layerID][cardChoice.card.id] = (chooseFreq[layerID][cardChoice.card.id] || 0) + 1;}
						cardSet.add(cardChoice.card.id);
					}
				}
			}
		}

		if (Object.keys(freq).length === 0) continue;

		const charDiv = cntContainer.appendChild(document.createElement('div'));
		charDiv.className = 'section';
		const charTitle = charDiv.appendChild(document.createElement('h2'));
		charTitle.textContent = characters[char];
		const numTitle = charDiv.appendChild(document.createElement('p'));
		numTitle.textContent = `有效局数：${runsCnt}`;
		const cardTitle = charDiv.appendChild(document.createElement('p'));
		cardTitle.textContent = `平均卡组大小：${(cardsCnt / runsCnt).toFixed(2)}`;

		const table = charDiv.appendChild(document.createElement('table'));
		table.className = 'run-table';

		const thead = table.appendChild(document.createElement('thead'));
		const headRow = thead.appendChild(document.createElement('tr'));

		const headers = ['牌名', '卡池', '稀有度', '局均张数', '平均抓率', '一层抓率', '二层抓率', '三层抓率'];

		for (let i = 0; i < headers.length; i++) {
			const th = headRow.appendChild(document.createElement('th'));
			th.textContent = headers[i];
			th.onclick = () => sortTable(table, i);
		}

		const tbody = table.appendChild(document.createElement('tbody'));

		for (const cardId of cardSet) {
			cardNameCN = cardNamesCN[cardId.split('.')[1] + ".title"];
			cardNameEN = cardNamesEN[cardId.split('.')[1] + ".title"];
			const infoItem = cardInfo.find(item => item.card_name === cardNameEN) || {"character": "?", "rarity": "?"};

			const row = tbody.appendChild(document.createElement('tr'));

			const tdId = row.appendChild(document.createElement('td'));
			tdId.textContent = cardNameCN;
			tdId.style.fontWeight = 'bold';

			const tdChar = row.appendChild(document.createElement('td'));
			tdChar.textContent = charactersInCardInfo[infoItem.character] || infoItem.character || "?";

			const tdRarity = row.appendChild(document.createElement('td'));
			tdRarity.textContent = rarityList[infoItem.class] || infoItem.class || "?";
			row.style.color = rarityColor[infoItem.class] || "#000000";

			const tdFreq = row.appendChild(document.createElement('td'));
			const count = freq[cardId] || 0;
			tdFreq.textContent = (count / runsCnt).toFixed(3);

			const tdChoose = row.appendChild(document.createElement('td'));
			const encounterCount = (encounterFreq[0][cardId] || 0) + (encounterFreq[1][cardId] || 0) + (encounterFreq[2][cardId] || 0);
			const chooseCount = (chooseFreq[0][cardId] || 0) + (chooseFreq[1][cardId] || 0) + (chooseFreq[2][cardId] || 0);
			tdChoose.textContent = encounterCount > 0 ? (chooseCount / encounterCount).toFixed(3) : '';
			tdChoose.style.fontWeight = 'bold';

			for (let layer = 0; layer < 3; layer++) {
				const tdLayer = row.appendChild(document.createElement('td'));
				const layerEncounterCount = encounterFreq[layer][cardId] || 0;
				const layerChooseCount = chooseFreq[layer][cardId] || 0;
				tdLayer.textContent = layerEncounterCount > 0 ? (layerChooseCount / layerEncounterCount).toFixed(3) : '';
			}
		}

		sortTable(table, 4, "desc");
		sortTable(table, 2, "asc");
		sortTable(table, 1, "asc");
	}
}

function sortTable(table, columnIndex, dir = null) {
	let tbody = table.querySelector("tbody");
	let rows = Array.from(table.rows).slice(1);
	let columnName = table.rows[0].cells[columnIndex].textContent.trim();
	let isAscending = dir ? (dir === "asc") : (table.getAttribute("data-sort-dir") === "desc");

	tbody.innerHTML = "";
	rows.sort((rowA, rowB) => {
		let cellA = rowA.cells[columnIndex].textContent.trim();
		let cellB = rowB.cells[columnIndex].textContent.trim();
		let isNumeric = isnum(cellA) && isnum(cellB);
		if (isNumeric) {
			if (cellA == "N/A" || cellA == "") {return 1;}
			if (cellB == "N/A" || cellB == "") {return -1;}
			return isAscending ? cellA - cellB : cellB - cellA;
		} else if (columnName == "稀有度") {
			const rarityOrder = ["普通", "稀有", "罕见", "先古", "状态", "诅咒", "任务", "标记", "事件", "基础"];
			let indexA = rarityOrder.indexOf(cellA);
			let indexB = rarityOrder.indexOf(cellB);
			return isAscending ? indexA - indexB : indexB - indexA;
		} else if (columnName == "卡池") {
			const charOrder = ["战士", "猎人", "储君", "亡灵", "机器人", "无色"];
			let indexA = charOrder.indexOf(cellA);
			let indexB = charOrder.indexOf(cellB);
			return isAscending ? indexA - indexB : indexB - indexA;
		} else {
			return isAscending ? cellA.localeCompare(cellB, 'zh') : cellB.localeCompare(cellA, 'zh')
		}
	});

	table.setAttribute("data-sort-dir", isAscending ? "asc" : "desc");

	rows.forEach(row => tbody.appendChild(row));
	let ths = table.querySelectorAll("th");
	if (isAscending) {
		ths.forEach(th => {
			th.classList.remove("asc");
			th.classList.remove("desc");
		});
		ths[columnIndex].classList.add("asc");
	} else {
		ths.forEach(th => {
			th.classList.remove("asc");
			th.classList.remove("desc");
		});
		ths[columnIndex].classList.add("desc");
	}
}

function isnum(str) {
	if (!isNaN(str)) {return true;}
	if (str == "") {return true;}
	if (str == "N/A") {return true;}
	return false;
}