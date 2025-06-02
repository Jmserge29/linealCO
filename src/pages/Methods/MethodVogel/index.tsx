import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Minus, RotateCcw, Play, FileText, AlertCircle, CheckCircle } from 'lucide-react';

// Tipos e interfaces
interface VogelStep {
  step: number;
  penalties: {
    rows: (number | null)[];
    cols: (number | null)[];
  };
  selectedPenalty: {
    type: 'row' | 'col';
    index: number;
    value: number;
  };
  selectedCell: {
    row: number;
    col: number;
    cost: number;
    allocation: number;
  };
  remainingSupply: number[];
  remainingDemand: number[];
  explanation: string;
  eliminatedRows: boolean[];
  eliminatedCols: boolean[];
}

interface VogelSolution {
  allocation: number[][];
  totalCost: number;
  finalMethod: 'vogel' | 'minimum_cost';
}

interface BalanceCheck {
  totalSupply: number;
  totalDemand: number;
  balanced: boolean;
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

const MethodVogel: React.FC = () => {
  // Estados principales
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [costs, setCosts] = useState<number[][]>([]);
  const [supply, setSupply] = useState<number[]>([]);
  const [demand, setDemand] = useState<number[]>([]);
  const [solution, setSolution] = useState<VogelSolution | null>(null);
  const [steps, setSteps] = useState<VogelStep[]>([]);
  const [showProcess, setShowProcess] = useState<boolean>(false);
  const [objective, setObjective] = useState<'minimize' | 'maximize'>('minimize');

  // Inicializar matrices cuando cambian las dimensiones
  useEffect(() => {
    const newCosts: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
    const newSupply: number[] = Array(rows).fill(0);
    const newDemand: number[] = Array(cols).fill(0);
    
    setCosts(newCosts);
    setSupply(newSupply);
    setDemand(newDemand);
    setSolution(null);
    setSteps([]);
  }, [rows, cols]);

  // Funciones de actualización
  const updateCost = (i: number, j: number, value: string): void => {
    const newCosts: number[][] = [...costs];
    newCosts[i][j] = parseFloat(value) || 0;
    setCosts(newCosts);
  };

  const updateSupply = (i: number, value: string): void => {
    const newSupply: number[] = [...supply];
    newSupply[i] = parseFloat(value) || 0;
    setSupply(newSupply);
  };

  const updateDemand = (j: number, value: string): void => {
    const newDemand: number[] = [...demand];
    newDemand[j] = parseFloat(value) || 0;
    setDemand(newDemand);
  };

  // Verificar balance
  const checkBalance = (): BalanceCheck => {
    const totalSupply: number = supply.reduce((sum: number, s: number) => sum + s, 0);
    const totalDemand: number = demand.reduce((sum: number, d: number) => sum + d, 0);
    return { totalSupply, totalDemand, balanced: totalSupply === totalDemand };
  };

  // Calcular penalizaciones
  const calculatePenalties = (
    currentCosts: number[][], 
    eliminatedRows: boolean[], 
    eliminatedCols: boolean[]
  ): { rows: (number | null)[], cols: (number | null)[] } => {
    const rowPenalties: (number | null)[] = Array(rows).fill(null);
    const colPenalties: (number | null)[] = Array(cols).fill(null);

    // Penalizaciones por filas
    for (let i = 0; i < rows; i++) {
      if (eliminatedRows[i]) continue;
      
      const availableCosts: number[] = [];
      for (let j = 0; j < cols; j++) {
        if (!eliminatedCols[j]) {
          availableCosts.push(currentCosts[i][j]);
        }
      }
      
      if (availableCosts.length >= 2) {
        availableCosts.sort((a, b) => objective === 'minimize' ? a - b : b - a);
        rowPenalties[i] = Math.abs(availableCosts[0] - availableCosts[1]);
      } else if (availableCosts.length === 1) {
        rowPenalties[i] = 0;
      }
    }

    // Penalizaciones por columnas
    for (let j = 0; j < cols; j++) {
      if (eliminatedCols[j]) continue;
      
      const availableCosts: number[] = [];
      for (let i = 0; i < rows; i++) {
        if (!eliminatedRows[i]) {
          availableCosts.push(currentCosts[i][j]);
        }
      }
      
      if (availableCosts.length >= 2) {
        availableCosts.sort((a, b) => objective === 'minimize' ? a - b : b - a);
        colPenalties[j] = Math.abs(availableCosts[0] - availableCosts[1]);
      } else if (availableCosts.length === 1) {
        colPenalties[j] = 0;
      }
    }

    return { rows: rowPenalties, cols: colPenalties };
  };

  // Seleccionar la mayor/menor penalización
  const selectBestPenalty = (penalties: { rows: (number | null)[], cols: (number | null)[] }): {
    type: 'row' | 'col';
    index: number;
    value: number;
  } | null => {
    let bestPenalty = objective === 'minimize' ? -1 : Infinity;
    let bestType: 'row' | 'col' = 'row';
    let bestIndex = -1;

    // Revisar penalizaciones de filas
    penalties.rows.forEach((penalty, index) => {
      if (penalty !== null) {
        if (objective === 'minimize' && penalty > bestPenalty) {
          bestPenalty = penalty;
          bestType = 'row';
          bestIndex = index;
        } else if (objective === 'maximize' && penalty < bestPenalty) {
          bestPenalty = penalty;
          bestType = 'row';
          bestIndex = index;
        }
      }
    });

    // Revisar penalizaciones de columnas
    penalties.cols.forEach((penalty, index) => {
      if (penalty !== null) {
        if (objective === 'minimize' && penalty > bestPenalty) {
          bestPenalty = penalty;
          bestType = 'col';
          bestIndex = index;
        } else if (objective === 'maximize' && penalty < bestPenalty) {
          bestPenalty = penalty;
          bestType = 'col';
          bestIndex = index;
        }
      }
    });

    return bestIndex !== -1 ? { type: bestType, index: bestIndex, value: bestPenalty } : null;
  };

  // Encontrar la mejor celda en la fila/columna seleccionada
  const findBestCellInSelection = (
    selectedPenalty: { type: 'row' | 'col'; index: number; value: number },
    currentCosts: number[][],
    remainingSupply: number[],
    remainingDemand: number[],
    eliminatedRows: boolean[],
    eliminatedCols: boolean[]
  ): { row: number; col: number; cost: number; allocation: number } | null => {
    let bestCost = objective === 'minimize' ? Infinity : -1;
    let bestRow = -1;
    let bestCol = -1;

    if (selectedPenalty.type === 'row') {
      const rowIndex = selectedPenalty.index;
      for (let j = 0; j < cols; j++) {
        if (!eliminatedCols[j] && remainingDemand[j] > 0) {
          const cost = currentCosts[rowIndex][j];
          if ((objective === 'minimize' && cost < bestCost) || 
              (objective === 'maximize' && cost > bestCost)) {
            bestCost = cost;
            bestRow = rowIndex;
            bestCol = j;
          }
        }
      }
    } else {
      const colIndex = selectedPenalty.index;
      for (let i = 0; i < rows; i++) {
        if (!eliminatedRows[i] && remainingSupply[i] > 0) {
          const cost = currentCosts[i][colIndex];
          if ((objective === 'minimize' && cost < bestCost) || 
              (objective === 'maximize' && cost > bestCost)) {
            bestCost = cost;
            bestRow = i;
            bestCol = colIndex;
          }
        }
      }
    }

    if (bestRow !== -1 && bestCol !== -1) {
      const allocation = Math.min(remainingSupply[bestRow], remainingDemand[bestCol]);
      return {
        row: bestRow,
        col: bestCol,
        cost: bestCost,
        allocation
      };
    }

    return null;
  };

  // Continuar con método de costo mínimo
  const continueWithMinimumCost = (
    allocation: number[][],
    remainingSupply: number[],
    remainingDemand: number[],
    eliminatedRows: boolean[],
    eliminatedCols: boolean[],
    stepNumber: number
  ): VogelStep[] => {
    const additionalSteps: VogelStep[] = [];

    while (remainingSupply.some(s => s > 0) && remainingDemand.some(d => d > 0)) {
      // Encontrar todas las celdas disponibles
      const availableCells: Array<{row: number, col: number, cost: number}> = [];
      
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (!eliminatedRows[i] && !eliminatedCols[j] && 
              remainingSupply[i] > 0 && remainingDemand[j] > 0) {
            availableCells.push({ row: i, col: j, cost: costs[i][j] });
          }
        }
      }

      if (availableCells.length === 0) break;

      // Encontrar el mejor costo
      const bestCell = availableCells.reduce((best, current) => {
        if (objective === 'minimize') {
          return current.cost < best.cost ? current : best;
        } else {
          return current.cost > best.cost ? current : best;
        }
      });

      const maxAllocation = Math.min(
        remainingSupply[bestCell.row], 
        remainingDemand[bestCell.col]
      );

      allocation[bestCell.row][bestCell.col] += maxAllocation;
      remainingSupply[bestCell.row] -= maxAllocation;
      remainingDemand[bestCell.col] -= maxAllocation;

      // Eliminar fila o columna si se agota
      if (remainingSupply[bestCell.row] === 0) {
        eliminatedRows[bestCell.row] = true;
      }
      if (remainingDemand[bestCell.col] === 0) {
        eliminatedCols[bestCell.col] = true;
      }

      additionalSteps.push({
        step: stepNumber++,
        penalties: { rows: [], cols: [] },
        selectedPenalty: { type: 'row', index: -1, value: 0 },
        selectedCell: {
          row: bestCell.row,
          col: bestCell.col,
          cost: bestCell.cost,
          allocation: maxAllocation
        },
        remainingSupply: [...remainingSupply],
        remainingDemand: [...remainingDemand],
        explanation: `Método Costo Mínimo: Asignar ${maxAllocation} unidades a (${bestCell.row + 1}, ${bestCell.col + 1}) con costo ${bestCell.cost}`,
        eliminatedRows: [...eliminatedRows],
        eliminatedCols: [...eliminatedCols]
      });
    }

    return additionalSteps;
  };

  // Algoritmo principal de Vogel
  const solveVogelMethod = (): void => {
    const { balanced } = checkBalance();
    if (!balanced) {
      alert('El problema debe estar balanceado (oferta total = demanda total)');
      return;
    }

    const allocation: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
    const remainingSupply: number[] = [...supply];
    const remainingDemand: number[] = [...demand];
    const eliminatedRows: boolean[] = Array(rows).fill(false);
    const eliminatedCols: boolean[] = Array(cols).fill(false);
    const processSteps: VogelStep[] = [];
    
    let stepNumber = 1;

    // Fase de Vogel
    while (true) {
      // Verificar si solo queda una fila o columna activa
      const activeRows = eliminatedRows.filter(eliminated => !eliminated).length;
      const activeCols = eliminatedCols.filter(eliminated => !eliminated).length;
      
      if (activeRows <= 1 || activeCols <= 1) {
        // Continuar con método de costo mínimo
        const additionalSteps = continueWithMinimumCost(
          allocation, remainingSupply, remainingDemand, 
          eliminatedRows, eliminatedCols, stepNumber
        );
        processSteps.push(...additionalSteps);
        break;
      }

      // Calcular penalizaciones
      const penalties = calculatePenalties(costs, eliminatedRows, eliminatedCols);
      
      // Seleccionar la mejor penalización
      const selectedPenalty = selectBestPenalty(penalties);
      if (!selectedPenalty) break;

      // Encontrar la mejor celda en la selección
      const bestCell = findBestCellInSelection(
        selectedPenalty, costs, remainingSupply, remainingDemand,
        eliminatedRows, eliminatedCols
      );
      
      if (!bestCell) break;

      // Realizar asignación
      allocation[bestCell.row][bestCell.col] += bestCell.allocation;
      remainingSupply[bestCell.row] -= bestCell.allocation;
      remainingDemand[bestCell.col] -= bestCell.allocation;

      // Eliminar fila o columna si se agota
      if (remainingSupply[bestCell.row] === 0) {
        eliminatedRows[bestCell.row] = true;
      }
      if (remainingDemand[bestCell.col] === 0) {
        eliminatedCols[bestCell.col] = true;
      }

      // Registrar el paso
      processSteps.push({
        step: stepNumber++,
        penalties,
        selectedPenalty,
        selectedCell: bestCell,
        remainingSupply: [...remainingSupply],
        remainingDemand: [...remainingDemand],
        explanation: `Penalización ${selectedPenalty.type === 'row' ? 'fila' : 'columna'} ${selectedPenalty.index + 1} = ${selectedPenalty.value}. Asignar ${bestCell.allocation} unidades a (${bestCell.row + 1}, ${bestCell.col + 1})`,
        eliminatedRows: [...eliminatedRows],
        eliminatedCols: [...eliminatedCols]
      });

      // Verificar si terminamos
      if (remainingSupply.every(s => s === 0) && remainingDemand.every(d => d === 0)) {
        break;
      }
    }

    // Calcular costo total
    let totalCost = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        totalCost += allocation[i][j] * costs[i][j];
      }
    }

    setSolution({ 
      allocation, 
      totalCost, 
      finalMethod: processSteps.some(step => step.explanation.includes('Costo Mínimo')) ? 'minimum_cost' : 'vogel'
    });
    setSteps(processSteps);
  };

  // Funciones auxiliares para la UI
  const resetAll = (): void => {
    setCosts(Array(rows).fill(null).map(() => Array(cols).fill(0)));
    setSupply(Array(rows).fill(0));
    setDemand(Array(cols).fill(0));
    setSolution(null);
    setSteps([]);
    setShowProcess(false);
  };

  const handleRowsChange = (increment: boolean): void => {
    if (increment) {
      setRows(Math.min(6, rows + 1));
    } else {
      setRows(Math.max(2, rows - 1));
    }
  };

  const handleColsChange = (increment: boolean): void => {
    if (increment) {
      setCols(Math.min(6, cols + 1));
    } else {
      setCols(Math.max(2, cols - 1));
    }
  };

  const { totalSupply, totalDemand, balanced } = checkBalance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      {/* Elementos de fondo decorativos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.7) 0%, rgba(99, 102, 241, 0.5) 40%, transparent 70%)'
          }}>
        </div>
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-2xl opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.6) 0%, rgba(168, 85, 247, 0.4) 50%, transparent 80%)'
          }}>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Calculator className="text-purple-600" />
            Método de Aproximación de Vogel
          </h1>
          <p className="text-lg text-gray-600">Algoritmo de Penalizaciones para Problemas de Transporte</p>
        </div>

        {/* Configuración */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración del Problema</h2>
          
          {/* Selector de objetivo */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Objetivo de Optimización</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="objective"
                  value="minimize"
                  checked={objective === 'minimize'}
                  onChange={(e) => setObjective(e.target.value as 'minimize')}
                  className="text-purple-600"
                />
                <span className="text-sm font-medium">Minimizar Costos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="objective"
                  value="maximize"
                  checked={objective === 'maximize'}
                  onChange={(e) => setObjective(e.target.value as 'maximize')}
                  className="text-purple-600"
                />
                <span className="text-sm font-medium">Maximizar Utilidades</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Orígenes (Filas):</label>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleRowsChange(false)}
                  className="p-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                  type="button"
                >
                  <Minus size={16} />
                </button>
                <span className="mx-3 font-mono text-lg">{rows}</span>
                <button 
                  onClick={() => handleRowsChange(true)}
                  className="p-1 rounded-md bg-green-100 text-green-600 hover:bg-green-200"
                  type="button"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Destinos (Columnas):</label>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleColsChange(false)}
                  className="p-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                  type="button"
                >
                  <Minus size={16} />
                </button>
                <span className="mx-3 font-mono text-lg">{cols}</span>
                <button 
                  onClick={() => handleColsChange(true)}
                  className="p-1 rounded-md bg-green-100 text-green-600 hover:bg-green-200"
                  type="button"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              type="button"
            >
              <RotateCcw size={16} />
              Limpiar Todo
            </button>
          </div>
        </div>

        {/* Tabla de datos */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Matriz de {objective === 'minimize' ? 'Costos' : 'Utilidades'} y Restricciones
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-300 p-3 bg-gray-50 text-sm font-semibold">Origen / Destino</th>
                  {Array(cols).fill(null).map((_, j: number) => (
                    <th key={j} className="border-2 border-gray-300 p-3 bg-purple-50 text-sm font-semibold">
                      D{j + 1}
                    </th>
                  ))}
                  <th className="border-2 border-gray-300 p-3 bg-green-50 text-sm font-semibold">Oferta</th>
                </tr>
              </thead>
              <tbody>
                {Array(rows).fill(null).map((_, i: number) => (
                  <tr key={i}>
                    <td className="border-2 border-gray-300 p-3 bg-purple-50 text-sm font-semibold text-center">
                      O{i + 1}
                    </td>
                    {Array(cols).fill(null).map((_, j: number) => (
                      <td key={j} className="border-2 border-gray-300 p-1">
                        <input
                          type="number"
                          value={costs[i]?.[j] || 0}
                          onChange={(e: InputChangeEvent) => updateCost(i, j, e.target.value)}
                          className="w-full p-2 text-center border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className="border-2 border-gray-300 p-1">
                      <input
                        type="number"
                        value={supply[i] || 0}
                        onChange={(e: InputChangeEvent) => updateSupply(i, e.target.value)}
                        className="w-full p-2 text-center border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border-2 border-gray-300 p-3 bg-green-50 text-sm font-semibold text-center">
                    Demanda
                  </td>
                  {Array(cols).fill(null).map((_, j: number) => (
                    <td key={j} className="border-2 border-gray-300 p-1">
                      <input
                        type="number"
                        value={demand[j] || 0}
                        onChange={(e: InputChangeEvent) => updateDemand(j, e.target.value)}
                        className="w-full p-2 text-center border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className="border-2 border-gray-300 p-3 bg-gray-100"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verificación de balance */}
          <div className="mt-4 p-4 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-6">
                <span className="text-sm">
                  <strong>Oferta Total:</strong> {totalSupply}
                </span>
                <span className="text-sm">
                  <strong>Demanda Total:</strong> {totalDemand}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                balanced 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {balanced ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {balanced ? 'Balanceado' : 'No Balanceado'}
              </div>
            </div>
          </div>
        </div>

        {/* Botón para resolver */}
        <div className="text-center mb-6">
          <button
            onClick={solveVogelMethod}
            disabled={!balanced}
            className={`flex items-center gap-2 mx-auto px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform ${
              balanced 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            type="button"
          >
            <Play size={20} />
            Resolver con Método de Vogel
          </button>
        </div>

        {/* Resultados */}
        {solution && (
          <div className="space-y-6">
            {/* Botón para mostrar proceso */}
            <div className="text-center">
              <button
                onClick={() => setShowProcess(!showProcess)}
                className="flex items-center gap-2 mx-auto px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                type="button"
              >
                <FileText size={18} />
                {showProcess ? 'Ocultar Proceso' : 'Ver Proceso Detallado'}
              </button>
            </div>

            {/* Proceso paso a paso */}
            {showProcess && steps.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Proceso Paso a Paso</h3>
                <div className="space-y-6">
                  {steps.map((step: VogelStep, index: number) => (
                    <div key={index} className="border border-purple-200 rounded-lg p-4 bg-purple-50/50">
                      {/* Header del paso */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                          Paso {step.step}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {step.explanation}
                        </span>
                      </div>
                      
                      {/* Mostrar penalizaciones si están disponibles */}
                      {step.penalties.rows.some(p => p !== null) && (
                        <div className="text-xs text-gray-600 mb-3 p-2 bg-white/60 rounded">
                          <strong>Penalizaciones:</strong>
                          <br />
                          Filas: [
                          {step.penalties.rows.map((p, i) => 
                            p !== null ? `F${i+1}:${p}` : `F${i+1}:-`
                          ).join(', ')}
                          ]
                          <br />
                          Columnas: [
                          {step.penalties.cols.map((p, j) => 
                            p !== null ? `C${j+1}:${p}` : `C${j+1}:-`
                          ).join(', ')}
                          ]
                        </div>
                      )}

                      {/* Tabla visual del paso */}
                      <div className="overflow-x-auto mb-3">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr>
                              <th className="border border-gray-400 p-2 bg-gray-100 text-xs font-semibold">O/D</th>
                              {Array(cols).fill(null).map((_, j: number) => (
                                <th key={j} className="border border-gray-400 p-2 bg-purple-100 text-xs font-semibold">
                                  D{j + 1}
                                </th>
                              ))}
                              <th className="border border-gray-400 p-2 bg-blue-100 text-xs font-semibold">Oferta</th>
                              <th className="border border-gray-400 p-2 bg-yellow-100 text-xs font-semibold">Rest.</th>
                              {step.penalties.rows.some(p => p !== null) && (
                                <th className="border border-gray-400 p-2 bg-red-100 text-xs font-semibold">Pen.F</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {Array(rows).fill(null).map((_, i: number) => (
                              <tr key={i}>
                                <td className={`border border-gray-400 p-2 text-center font-semibold text-xs ${
                                  step.eliminatedRows[i] ? 'bg-red-100 text-red-600 line-through' : 'bg-purple-100'
                                }`}>
                                  O{i + 1}
                                </td>
                                {Array(cols).fill(null).map((_, j: number) => {
                                  // Calcular asignación actual hasta este paso
                                  let currentAllocation = 0;
                                  for (let s = 0; s <= index; s++) {
                                    if (steps[s].selectedCell.row === i && steps[s].selectedCell.col === j) {
                                      currentAllocation += steps[s].selectedCell.allocation;
                                    }
                                  }
                                  
                                  const isSelectedCell = step.selectedCell.row === i && step.selectedCell.col === j;
                                  const isEliminatedCell = step.eliminatedRows[i] || step.eliminatedCols[j];
                                  const isInSelectedRowCol = (step.selectedPenalty?.type === 'row' && step.selectedPenalty?.index === i) ||
                                                           (step.selectedPenalty?.type === 'col' && step.selectedPenalty?.index === j);
                                  
                                  return (
                                    <td key={j} className={`border border-gray-400 p-1 text-center relative ${
                                      isSelectedCell 
                                        ? 'bg-green-200 border-green-500 border-2' 
                                        : isEliminatedCell 
                                        ? 'bg-gray-200 text-gray-500'
                                        : isInSelectedRowCol && !isEliminatedCell
                                        ? 'bg-blue-100'
                                        : 'bg-white'
                                    }`}>
                                      {/* Costo en la esquina superior */}
                                      <div className="text-xs text-gray-600 absolute top-0 left-0 p-0.5 leading-none">
                                        {costs[i][j]}
                                      </div>
                                      
                                      {/* Asignación en el centro */}
                                      <div className={`text-sm font-bold mt-2 ${
                                        currentAllocation > 0 ? 'text-green-800' : 'text-gray-400'
                                      }`}>
                                        {currentAllocation > 0 ? currentAllocation : '-'}
                                      </div>
                                      
                                      {/* Indicador de celda seleccionada */}
                                      {isSelectedCell && (
                                        <div className="text-xs text-green-700 absolute bottom-0 right-0 p-0.5 leading-none">
                                          +{step.selectedCell.allocation}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="border border-gray-400 p-2 text-center text-xs bg-blue-50">
                                  {supply[i]}
                                </td>
                                <td className={`border border-gray-400 p-2 text-center text-xs font-bold ${
                                  step.remainingSupply[i] === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-50'
                                }`}>
                                  {step.remainingSupply[i]}
                                </td>
                                {step.penalties.rows.some(p => p !== null) && (
                                  <td className={`border border-gray-400 p-2 text-center text-xs font-bold ${
                                    step.selectedPenalty?.type === 'row' && step.selectedPenalty?.index === i
                                      ? 'bg-red-200 text-red-800 border-red-400'
                                      : step.penalties.rows[i] !== null
                                      ? 'bg-red-50'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {step.penalties.rows[i] !== null ? step.penalties.rows[i] : '-'}
                                  </td>
                                )}
                              </tr>
                            ))}
                            {/* Fila de demanda */}
                            <tr>
                              <td className="border border-gray-400 p-2 bg-blue-100 text-center text-xs font-semibold">
                                Demanda
                              </td>
                              {Array(cols).fill(null).map((_, j: number) => (
                                <td key={j} className="border border-gray-400 p-2 text-center text-xs bg-blue-50">
                                  {demand[j]}
                                </td>
                              ))}
                              <td className="border border-gray-400 p-2 bg-gray-100"></td>
                              <td className="border border-gray-400 p-2 bg-gray-100"></td>
                              {step.penalties.rows.some(p => p !== null) && (
                                <td className="border border-gray-400 p-2 bg-gray-100"></td>
                              )}
                            </tr>
                            {/* Fila de demanda restante */}
                            <tr>
                              <td className="border border-gray-400 p-2 bg-yellow-100 text-center text-xs font-semibold">
                                Rest.
                              </td>
                              {Array(cols).fill(null).map((_, j: number) => (
                                <td key={j} className={`border border-gray-400 p-2 text-center text-xs font-bold ${
                                  step.remainingDemand[j] === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-50'
                                }`}>
                                  {step.remainingDemand[j]}
                                </td>
                              ))}
                              <td className="border border-gray-400 p-2 bg-gray-100"></td>
                              <td className="border border-gray-400 p-2 bg-gray-100"></td>
                              {step.penalties.rows.some(p => p !== null) && (
                                <td className="border border-gray-400 p-2 bg-gray-100"></td>
                              )}
                            </tr>
                            {/* Fila de penalizaciones de columnas */}
                            {step.penalties.cols.some(p => p !== null) && (
                              <tr>
                                <td className="border border-gray-400 p-2 bg-red-100 text-center text-xs font-semibold">
                                  Pen.C
                                </td>
                                {Array(cols).fill(null).map((_, j: number) => (
                                  <td key={j} className={`border border-gray-400 p-2 text-center text-xs font-bold ${
                                    step.selectedPenalty?.type === 'col' && step.selectedPenalty?.index === j
                                      ? 'bg-red-200 text-red-800 border-red-400'
                                      : step.penalties.cols[j] !== null
                                      ? 'bg-red-50'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {step.penalties.cols[j] !== null ? step.penalties.cols[j] : '-'}
                                  </td>
                                ))}
                                <td className="border border-gray-400 p-2 bg-gray-100"></td>
                                <td className="border border-gray-400 p-2 bg-gray-100"></td>
                                {step.penalties.rows.some(p => p !== null) && (
                                  <td className="border border-gray-400 p-2 bg-gray-100"></td>
                                )}
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Leyenda de colores */}
                      <div className="flex flex-wrap gap-4 text-xs mt-3">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-200 border border-green-500 rounded"></div>
                          <span>Celda seleccionada</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-100 rounded"></div>
                          <span>Fila/columna de penalización seleccionada</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-200 rounded"></div>
                          <span>Penalización seleccionada</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-200 rounded"></div>
                          <span>Celdas eliminadas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-100 rounded"></div>
                          <span>Restricción satisfecha</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solución final */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Solución Final</h3>
              
              {/* Indicador del método usado */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {solution.finalMethod === 'vogel' 
                      ? 'Solución obtenida completamente con el Método de Vogel'
                      : 'Solución obtenida con Método de Vogel + Método de Costo Mínimo'
                    }
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-300 p-3 bg-gray-50 text-sm font-semibold">Asignación</th>
                      {Array(cols).fill(null).map((_, j: number) => (
                        <th key={j} className="border-2 border-gray-300 p-3 bg-purple-50 text-sm font-semibold">
                          D{j + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array(rows).fill(null).map((_, i: number) => (
                      <tr key={i}>
                        <td className="border-2 border-gray-300 p-3 bg-purple-50 text-sm font-semibold text-center">
                          O{i + 1}
                        </td>
                        {Array(cols).fill(null).map((_, j: number) => (
                          <td key={j} className={`border-2 border-gray-300 p-3 text-center font-mono ${
                            solution.allocation[i][j] > 0 
                              ? 'bg-green-100 text-green-800 font-bold' 
                              : 'bg-gray-50 text-gray-400'
                          }`}>
                            {solution.allocation[i][j] || 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {objective === 'minimize' ? 'Costo Total' : 'Utilidad Total'}: ${solution.totalCost.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Calculado usando el Método de Aproximación de Vogel
                  </div>
                </div>
              </div>

              {/* Detalle del cálculo */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Detalle del Cálculo:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {solution.allocation.map((row: number[], i: number) => 
                    row.map((allocation: number, j: number) => 
                      allocation > 0 && (
                        <div key={`${i}-${j}`} className="text-gray-700">
                          O{i+1} → D{j+1}: {allocation} × ${costs[i][j]} = ${(allocation * costs[i][j]).toFixed(2)}
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              {/* Explicación del método */}
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">🎯 Sobre el Método de Vogel:</h4>
                <div className="text-sm text-purple-700 space-y-1">
                  <p><strong>1. Penalizaciones:</strong> Se calculan restando los dos {objective === 'minimize' ? 'menores costos' : 'mayores utilidades'} de cada fila y columna.</p>
                  <p><strong>2. Selección:</strong> Se elige la {objective === 'minimize' ? 'mayor' : 'menor'} penalización para priorizar asignaciones críticas.</p>
                  <p><strong>3. Asignación:</strong> Se asigna la mayor cantidad posible en la celda con {objective === 'minimize' ? 'menor costo' : 'mayor utilidad'} de la fila/columna seleccionada.</p>
                  <p><strong>4. Continuación:</strong> Cuando queda solo una fila o columna, se continúa con el método de costo mínimo.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MethodVogel;