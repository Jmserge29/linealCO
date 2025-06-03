import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Minus, RotateCcw, Play, FileText } from 'lucide-react';
import { Button } from '../../../components/Buttons';

// Tipos e interfaces
interface ProcessStep {
  step: number;
  row: number;
  col: number;
  allocation: number;
  remainingSupply: number[];
  remainingDemand: number[];
  explanation: string;
}

interface Solution {
  allocation: number[][];
  totalCost: number;
}

interface BalanceCheck {
  totalSupply: number;
  totalDemand: number;
  balanced: boolean;
}

// Tipos para los eventos de input
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

const MethodNorthwest: React.FC = () => {
  // Estados con tipos explícitos
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [costs, setCosts] = useState<number[][]>([]);
  const [supply, setSupply] = useState<number[]>([]);
  const [demand, setDemand] = useState<number[]>([]);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [showProcess, setShowProcess] = useState<boolean>(false);

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

  // Función para actualizar costos
  const updateCost = (i: number, j: number, value: string): void => {
    const newCosts: number[][] = [...costs];
    newCosts[i][j] = parseFloat(value) || 0;
    setCosts(newCosts);
  };

  // Función para actualizar oferta
  const updateSupply = (i: number, value: string): void => {
    const newSupply: number[] = [...supply];
    newSupply[i] = parseFloat(value) || 0;
    setSupply(newSupply);
  };

  // Función para actualizar demanda
  const updateDemand = (j: number, value: string): void => {
    const newDemand: number[] = [...demand];
    newDemand[j] = parseFloat(value) || 0;
    setDemand(newDemand);
  };

  // Función para verificar balance
  const checkBalance = (): BalanceCheck => {
    const totalSupply: number = supply.reduce((sum: number, s: number) => sum + s, 0);
    const totalDemand: number = demand.reduce((sum: number, d: number) => sum + d, 0);
    return { 
      totalSupply, 
      totalDemand, 
      balanced: totalSupply === totalDemand 
    };
  };

  // Algoritmo de la esquina noroeste
  const solveNorthwestCorner = (): void => {
    const { balanced }: BalanceCheck = checkBalance();
    if (!balanced) {
      alert('El problema debe estar balanceado (oferta total = demanda total)');
      return;
    }

    const allocation: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
    const remainingSupply: number[] = [...supply];
    const remainingDemand: number[] = [...demand];
    const processSteps: ProcessStep[] = [];
    
    let currentRow: number = 0;
    let currentCol: number = 0;
    let stepNumber: number = 1;

    while (currentRow < rows && currentCol < cols) {
      const maxAllocation: number = Math.min(remainingSupply[currentRow], remainingDemand[currentCol]);
      
      if (maxAllocation > 0) {
        allocation[currentRow][currentCol] = maxAllocation;
        remainingSupply[currentRow] -= maxAllocation;
        remainingDemand[currentCol] -= maxAllocation;

        processSteps.push({
          step: stepNumber++,
          row: currentRow,
          col: currentCol,
          allocation: maxAllocation,
          remainingSupply: [...remainingSupply],
          remainingDemand: [...remainingDemand],
          explanation: `Asignar ${maxAllocation} unidades a la celda (${currentRow + 1}, ${currentCol + 1})`
        });
      }

      // Decidir el siguiente movimiento según el algoritmo
      if (remainingSupply[currentRow] === 0 && remainingDemand[currentCol] === 0) {
        // Ambos satisfechos: mover a la siguiente fila y columna
        currentRow++;
        currentCol++;
      } else if (remainingSupply[currentRow] === 0) {
        // Fila satisfecha: mover a la siguiente fila
        currentRow++;
      } else if (remainingDemand[currentCol] === 0) {
        // Columna satisfecha: mover a la siguiente columna
        currentCol++;
      }
    }

    // Calcular costo total
    let totalCost: number = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        totalCost += allocation[i][j] * costs[i][j];
      }
    }

    setSolution({ allocation, totalCost });
    setSteps(processSteps);
  };

  // Función para resetear todo
  const resetAll = (): void => {
    setCosts(Array(rows).fill(null).map(() => Array(cols).fill(0)));
    setSupply(Array(rows).fill(0));
    setDemand(Array(cols).fill(0));
    setSolution(null);
    setSteps([]);
    setShowProcess(false);
  };

  // Función para manejar cambio de filas
  const handleRowsChange = (increment: boolean): void => {
    if (increment) {
      setRows(Math.min(6, rows + 1));
    } else {
      setRows(Math.max(2, rows - 1));
    }
  };

  // Función para manejar cambio de columnas
  const handleColsChange = (increment: boolean): void => {
    if (increment) {
      setCols(Math.min(6, cols + 1));
    } else {
      setCols(Math.max(2, cols - 1));
    }
  };

  // Función para alternar mostrar proceso
  const toggleShowProcess = (): void => {
    setShowProcess(!showProcess);
  };

  // Verificar balance
  const { totalSupply, totalDemand, balanced }: BalanceCheck = checkBalance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Calculator className="text-rose-600" />
            Problema de Transporte
          </h1>
          <p className="text-lg text-gray-600">Método de la Esquina Noroeste</p>
        </div>

        {/* Configuración de dimensiones */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración del Problema</h2>
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

        {/* Tabla de costos y datos */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Matriz de Costos y Restricciones</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-gray-300 p-3 bg-gray-50 text-sm font-semibold">Origen / Destino</th>
                  {Array(cols).fill(null).map((_, j: number) => (
                    <th key={j} className="border-2 border-gray-300 p-3 bg-rose-50 text-sm font-semibold">
                      D{j + 1}
                    </th>
                  ))}
                  <th className="border-2 border-gray-300 p-3 bg-green-50 text-sm font-semibold">Oferta</th>
                </tr>
              </thead>
              <tbody>
                {Array(rows).fill(null).map((_, i: number) => (
                  <tr key={i}>
                    <td className="border-2 border-gray-300 p-3 bg-rose-50 text-sm font-semibold text-center">
                      O{i + 1}
                    </td>
                    {Array(cols).fill(null).map((_, j: number) => (
                      <td key={j} className="border-2 border-gray-300 p-1">
                        <input
                          type="number"
                          value={costs[i]?.[j] || 0}
                          onChange={(e: InputChangeEvent) => updateCost(i, j, e.target.value)}
                          className="w-full p-2 text-center border rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                balanced 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {balanced ? '✓ Balanceado' : '✗ No Balanceado'}
              </div>
            </div>
          </div>
        </div>

        {/* Botón para resolver */}
        <div className="text-center mb-6">
          <Button
            onClick={solveNorthwestCorner}
            disabled={!balanced}
            className={`flex items-center gap-2 mx-auto px-8 py-3 rounded-lg font-semibold transition-colors ${
              balanced 
                ? 'bg-rose-600 text-white hover:bg-rose-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            type="button"
          >
            <p className='flex items-center gap-2'>
              <Play size={20} />
              Resolver con Método Esquina Noroeste
            </p>
          </Button>
        </div>

        {/* Resultados */}
        {solution && (
          <div className="space-y-6">
            {/* Botón para mostrar proceso */}
            <div className="text-center">
              <button
                onClick={toggleShowProcess}
                className="flex items-center gap-2 mx-auto px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                type="button"
              >
                <FileText size={18} />
                {showProcess ? 'Ocultar Proceso' : 'Ver Proceso Detallado'}
              </button>
            </div>

            {/* Proceso paso a paso */}
            {showProcess && steps.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Proceso Paso a Paso</h3>
                <div className="space-y-6">
                  {steps.map((step: ProcessStep, index: number) => (
                    <div key={index} className="border border-rose-200 rounded-lg p-4 bg-rose-50/50">
                      {/* Header del paso */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-rose-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                          Paso {step.step}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {step.explanation}
                        </span>
                      </div>

                      {/* Tabla visual del paso */}
                      <div className="overflow-x-auto mb-3">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr>
                              <th className="border border-gray-400 p-2 bg-gray-100 text-xs font-semibold">O/D</th>
                              {Array(cols).fill(null).map((_, j: number) => (
                                <th key={j} className={`border border-gray-400 p-2 text-xs font-semibold ${
                                  j === step.col ? 'bg-rose-200' : 'bg-rose-100'
                                }`}>
                                  D{j + 1}
                                </th>
                              ))}
                              <th className="border border-gray-400 p-2 bg-green-100 text-xs font-semibold">Oferta</th>
                              <th className="border border-gray-400 p-2 bg-yellow-100 text-xs font-semibold">Rest.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array(rows).fill(null).map((_, i: number) => (
                              <tr key={i}>
                                <td className={`border border-gray-400 p-2 text-center font-semibold text-xs ${
                                  i === step.row ? 'bg-rose-200' : 'bg-rose-100'
                                }`}>
                                  O{i + 1}
                                </td>
                                {Array(cols).fill(null).map((_, j: number) => {
                                  // Calcular asignación actual hasta este paso
                                  let currentAllocation = 0;
                                  for (let s = 0; s <= index; s++) {
                                    if (steps[s].row === i && steps[s].col === j) {
                                      currentAllocation += steps[s].allocation;
                                    }
                                  }
                                  
                                  const isSelectedCell = step.row === i && step.col === j;
                                  const isCurrentPosition = i <= step.row && j <= step.col;
                                  const isProcessedCell = currentAllocation > 0;
                                  const isEliminatedRow = step.remainingSupply[i] === 0;
                                  const isEliminatedCol = step.remainingDemand[j] === 0;
                                  
                                  return (
                                    <td key={j} className={`border border-gray-400 p-1 text-center relative ${
                                      isSelectedCell 
                                        ? 'bg-green-200 border-green-500 border-2' 
                                        : isProcessedCell
                                        ? 'bg-green-100'
                                        : isCurrentPosition && !isProcessedCell
                                        ? 'bg-yellow-100'
                                        : (isEliminatedRow || isEliminatedCol) && (i > step.row || j > step.col)
                                        ? 'bg-gray-200 text-gray-500'
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
                                          +{step.allocation}
                                        </div>
                                      )}

                                      {/* Indicador de posición actual (esquina noroeste) */}
                                      {i === step.row && j === step.col && !isSelectedCell && (
                                        <div className="text-xs text-rose-700 absolute top-0 right-0 p-0.5 leading-none">
                                          ↖
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="border border-gray-400 p-2 text-center text-xs bg-green-50">
                                  {supply[i]}
                                </td>
                                <td className={`border border-gray-400 p-2 text-center text-xs font-bold ${
                                  step.remainingSupply[i] === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-50'
                                }`}>
                                  {step.remainingSupply[i]}
                                </td>
                              </tr>
                            ))}
                            {/* Fila de demanda */}
                            <tr>
                              <td className="border border-gray-400 p-2 bg-green-100 text-center text-xs font-semibold">
                                Demanda
                              </td>
                              {Array(cols).fill(null).map((_, j: number) => (
                                <td key={j} className="border border-gray-400 p-2 text-center text-xs bg-green-50">
                                  {demand[j]}
                                </td>
                              ))}
                              <td className="border border-gray-400 p-2 bg-gray-100"></td>
                              <td className="border border-gray-400 p-2 bg-gray-100"></td>
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
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Información adicional del paso */}
                      <div className="text-xs text-gray-600 mb-3 p-2 bg-white/60 rounded">
                        <strong>Movimiento:</strong> Desde posición ({step.row + 1}, {step.col + 1}), 
                        asignar {step.allocation} unidades (min de oferta restante: {step.remainingSupply[step.row] + step.allocation} 
                        y demanda restante: {step.remainingDemand[step.col] + step.allocation})
                      </div>

                      {/* Leyenda de colores */}
                      <div className="flex flex-wrap gap-4 text-xs mt-3">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-200 border border-green-500 rounded"></div>
                          <span>Celda seleccionada (asignación actual)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-100 rounded"></div>
                          <span>Celdas ya procesadas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-rose-200 rounded"></div>
                          <span>Fila/columna actual</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                          <span>Región activa (esquina noroeste)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-200 rounded"></div>
                          <span>Región no disponible</span>
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Solución Final</h3>
              
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-300 p-3 bg-gray-50 text-sm font-semibold">Asignación</th>
                      {Array(cols).fill(null).map((_, j: number) => (
                        <th key={j} className="border-2 border-gray-300 p-3 bg-rose-50 text-sm font-semibold">
                          D{j + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array(rows).fill(null).map((_, i: number) => (
                      <tr key={i}>
                        <td className="border-2 border-gray-300 p-3 bg-rose-50 text-sm font-semibold text-center">
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

              <div className="bg-gradient-to-r from-green-100 to-rose-100 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    Costo Total: ${solution.totalCost.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Calculado usando el Método de la Esquina Noroeste
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MethodNorthwest;