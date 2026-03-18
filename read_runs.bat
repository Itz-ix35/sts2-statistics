@echo off
setlocal enabledelayedexpansion

set OUTPUT=runs\runs.json

echo [ > %OUTPUT%

set FIRST=1

for %%f in (runs\*.run) do (
    if !FIRST! == 0 (
        echo , >> %OUTPUT%
    )
    set FIRST=0

    echo "%%~nxf" >> %OUTPUT%
)

echo ] >> %OUTPUT%

echo Done: %OUTPUT%