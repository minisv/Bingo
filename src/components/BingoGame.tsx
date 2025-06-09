import { useState, useEffect } from 'react';
import './BingoGame.css';

type BingoMode = 'edit' | 'play';
type BingoCell = {
  text: string;
  selected: boolean;
};

const BingoGame: React.FC = () => {
  const [mode, setMode] = useState<BingoMode>('edit');
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [board, setBoard] = useState<BingoCell[][]>([]);
  const [completedLines, setCompletedLines] = useState<string[]>([]);

  // 초기 보드 생성
  useEffect(() => {
    initializeBoard();
  }, [rows, cols]);

  // 보드 초기화 함수
  const initializeBoard = () => {
    const newBoard: BingoCell[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: BingoCell[] = [];
      for (let j = 0; j < cols; j++) {
        row.push({ text: '', selected: false });
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
    setCompletedLines([]);
  };

  // 셀 텍스트 변경 핸들러
  const handleCellTextChange = (rowIndex: number, colIndex: number, value: string) => {
    if (mode !== 'edit') return;

    const newBoard = [...board];
    newBoard[rowIndex][colIndex].text = value;
    setBoard(newBoard);
  };

  // 셀 선택 토글 핸들러
  const handleCellClick = (rowIndex: number, colIndex: number, isRightClick: boolean = false) => {
    if (mode !== 'play') return;

    const newBoard = [...board];
    if (isRightClick) {
      newBoard[rowIndex][colIndex].selected = false;
    } else {
      newBoard[rowIndex][colIndex].selected = true;
    }
    setBoard(newBoard);

    // 빙고 확인
    checkBingo(newBoard);
  };

  // 빙고 확인 함수
  const checkBingo = (currentBoard: BingoCell[][]) => {
    const newCompletedLines: string[] = [];

    // 가로 확인
    for (let i = 0; i < rows; i++) {
      if (currentBoard[i].every((cell) => cell.selected)) {
        newCompletedLines.push(`row-${i}`);
      }
    }

    // 세로 확인
    for (let j = 0; j < cols; j++) {
      if (currentBoard.every((row) => row[j].selected)) {
        newCompletedLines.push(`col-${j}`);
      }
    }

    // 대각선 확인 (왼쪽 상단 -> 오른쪽 하단)
    if (rows === cols && currentBoard.every((row, idx) => row[idx].selected)) {
      newCompletedLines.push('diag-1');
    }

    // 대각선 확인 (오른쪽 상단 -> 왼쪽 하단)
    if (rows === cols && currentBoard.every((row, idx) => row[cols - 1 - idx].selected)) {
      newCompletedLines.push('diag-2');
    }

    setCompletedLines(newCompletedLines);
  };

  // 모드 전환 핸들러
  const toggleMode = () => {
    if (mode === 'edit') {
      // 모든 셀에 텍스트가 있는지 확인
      const allCellsFilled = board.every(row => 
        row.every(cell => cell.text.trim() !== '')
      );

      if (!allCellsFilled) {
        alert('모든 칸에 텍스트를 입력해주세요.');
        return;
      }

      setMode('play');
    } else {
      setMode('edit');
      // 플레이 모드에서 편집 모드로 돌아갈 때 선택 상태 초기화
      const resetBoard = board.map(row => 
        row.map(cell => ({ ...cell, selected: false }))
      );
      setBoard(resetBoard);
      setCompletedLines([]);
    }
  };

  // 크기 변경 핸들러
  const handleSizeChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    initializeBoard();
  };

  return (
    <div className="bingo-container">
      <div className="bingo-controls">
        <button 
          className={`mode-toggle ${mode}`} 
          onClick={toggleMode}
        >
          {mode === 'edit' ? '게임 시작' : '편집 모드로 전환'}
        </button>

        {mode === 'edit' && (
          <form onSubmit={handleSizeChange} className="size-form">
            <div>
              <label htmlFor="rows">칸 수:</label>
              <input 
                type="number" 
                id="rows" 
                min="2" 
                max="10" 
                value={rows} 
                onChange={(e) => {setRows(Number(e.target.value)); setCols(Number(e.target.value));}}
                required
              />
            </div>
          </form>
        )}
      </div>

      <div 
        className={`bingo-board ${mode}`}
        style={{ 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`}
              className={`bingo-cell ${cell.selected ? 'selected' : ''}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleCellClick(rowIndex, colIndex, true);
              }}
            >
              {mode === 'edit' ? (
                <input 
                  type="text" 
                  value={cell.text} 
                  onChange={(e) => handleCellTextChange(rowIndex, colIndex, e.target.value)}
                  maxLength={20}
                />
              ) : (
                <span>{cell.text}</span>
              )}
            </div>
          ))
        ))}

        {/* 완성된 라인 표시 */}
        {completedLines.map((line) => {
          const [type, index] = line.split('-');
          let className = '';
          let style = {};

          if (type === 'row') {
            className = 'bingo-line horizontal';
            style = { top: `calc(${Number(index) * 100 / rows}% + ${50 / rows}%)` };
          } else if (type === 'col') {
            className = 'bingo-line vertical';
            style = { left: `calc(${Number(index) * 100 / cols}% + ${50 / cols}%)` };
          } else if (type === 'diag' && index === '1') {
            className = 'bingo-line diagonal-1';
          } else if (type === 'diag' && index === '2') {
            className = 'bingo-line diagonal-2';
          }

          return (
            <div key={line} className={className} style={style} />
          );
        })}
      </div>

      {mode === 'play' && completedLines.length > 0 && (
        <div className="bingo-message">
          <h2>빙고 완성! ({completedLines.length}줄)</h2>
        </div>
      )}
    </div>
  );
};

export default BingoGame;
