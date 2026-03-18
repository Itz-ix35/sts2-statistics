# sts2-statistics

杀戮尖塔 2 简易卡牌抓率统计。

### 使用方法

- 克隆本仓库。

- 删除 `runs` 目录下的所有文件（它们是一个示例，来自作者本人的对局记录）。

- 找到自己的对局记录文件，通常在 `C:\Users\<用户名>\AppData\Roaming\SlayTheSpire2\steam\<一串数字>\profile<存档序号>\saves\history` 中，格式为一系列 `.run` 文件。

- 复制所有 `.run` 文件（或仅仅是你希望统计的一部分对局）后粘贴到仓库的 `runs` 文件夹内。

- 在仓库根目录下运行 `read_runs.bat`。

- 在仓库根目录下运行 `python -m http.server 4000`。

- 在浏览器中输入 `http://localhost:4000/` 查看。

### Acknowledgement

卡牌数据来源于 https://github.com/NightCodeOfficial/sts2-data/tree/main 。