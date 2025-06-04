import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Minus, RotateCcw, Play, FileText, AlertCircle, CheckCircle, Target, TrendingUp } from 'lucide-react';

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

interface MODIStep {
  step: number;
  ui: number[];
  vj: number[];
  cij: number[][];
  dualVariables: string;
  mostNegative: {
    row: number;
    col: number;
    value: number;
  } | null;
  isOptimal: boolean;
  circuit?: {
    path: {row: number, col: number}[];
    theta: number;
    explanation: string;
  };
  newAllocation?: number[][];
  explanation: string;
}

interface Solution {
  allocation: number[][];
  totalCost: number;
  isOptimal?: boolean;
  modiSteps?: MODIStep[];
  finalAllocation?: number[][];
  finalCost?: number;
}

interface BalanceCheck {
  totalSupply: number;
  totalDemand: number;
  balanced: boolean;
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

const MethodNorthwest: React.FC = () => {
  // Estados principales
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [costs, setCosts] = useState<number[][]>([]);
  const [supply, setSupply] = useState<number[]>([]);
  const [demand, setDemand] = useState<number[]>([]);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [showProcess, setShowProcess] = useState<boolean>(false);
  const [showMODI, setShowMODI] = useState<boolean>(false);
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
    return { 
      totalSupply, 
      totalDemand, 
      balanced: totalSupply === totalDemand 
    };
  };

  // FUNCIONES PARA MODI

  // Encontrar variables básicas
  const findBasicVariables = (allocation: number[][]): {row: number, col: number}[] => {
    const basicVars: {row: number, col: number}[] = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (allocation[i][j] > 0) {
          basicVars.push({row: i, col: j});
        }
      }
    }
    return basicVars;
  };

  // Calcular variables duales ui y vj
  const calculateDualVariables = (basicVars: {row: number, col: number}[]): {ui: number[], vj: number[]} => {
    const ui: number[] = Array(rows).fill(null);
    const vj: number[] = Array(cols).fill(null);
    
    // Inicializar u1 = 0
    ui[0] = 0;
    
    let changed = true;
    let iterations = 0;
    const maxIterations = rows + cols;
    
    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      
      for (const {row, col} of basicVars) {
        if (ui[row] !== null && vj[col] === null) {
          vj[col] = costs[row][col] - ui[row];
          changed = true;
        } else if (vj[col] !== null && ui[row] === null) {
          ui[row] = costs[row][col] - vj[col];
          changed = true;
        }
      }
    }
    
    return {ui, vj};
  };

  // Calcular costos de oportunidad (cij - ui - vj)
  const calculateOpportunityCosts = (ui: number[], vj: number[]): number[][] => {
    const cij: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(0));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (ui[i] !== null && vj[j] !== null) {
          cij[i][j] = costs[i][j] - ui[i] - vj[j];
        }
      }
    }
    
    return cij;
  };

  // Encontrar la variable más negativa (para minimización)
  const findMostNegative = (cij: number[][], allocation: number[][]): {row: number, col: number, value: number} | null => {
    let mostNegative: {row: number, col: number, value: number} | null = null;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (allocation[i][j] === 0) { // Solo variables no básicas
          if (objective === 'minimize') {
            if (cij[i][j] < 0 && (mostNegative === null || cij[i][j] < mostNegative.value)) {
              mostNegative = {row: i, col: j, value: cij[i][j]};
            }
          } else {
            if (cij[i][j] > 0 && (mostNegative === null || cij[i][j] > mostNegative.value)) {
              mostNegative = {row: i, col: j, value: cij[i][j]};
            }
          }
        }
      }
    }
    
    return mostNegative;
  };

  // Encontrar circuito para la variable entrante
  const findCircuit = (allocation: number[][], enteringVar: {row: number, col: number}): {row: number, col: number}[] => {
    const basicVars = findBasicVariables(allocation);
    const path: {row: number, col: number}[] = [enteringVar];
    
    // Algoritmo de búsqueda de circuito usando DFS
    const visited = new Set<string>();
    
    const dfs = (current: {row: number, col: number}, isRowStep: boolean): boolean => {
      const key = `${current.row}-${current.col}`;
      if (visited.has(key)) return false;
      visited.add(key);
      
      if (isRowStep) {
        // Buscar en la misma fila
        for (const basicVar of basicVars) {
          if (basicVar.row === current.row && basicVar.col !== current.col) {
            path.push(basicVar);
            if (basicVar.col === enteringVar.col && path.length > 2) {
              return true; // Circuito encontrado
            }
            if (dfs(basicVar, false)) return true;
            path.pop();
          }
        }
      } else {
        // Buscar en la misma columna
        for (const basicVar of basicVars) {
          if (basicVar.col === current.col && basicVar.row !== current.row) {
            path.push(basicVar);
            if (basicVar.col === enteringVar.col && path.length > 2) {
              return true; // Circuito encontrado
            }
            if (dfs(basicVar, true)) return true;
            path.pop();
          }
        }
      }
      
      visited.delete(key);
      return false;
    };
    
    // Iniciar búsqueda desde la variable entrante
    if (dfs(enteringVar, true)) {
      return path;
    }
    
    // Si no se encuentra circuito con búsqueda en fila, intentar con columna
    path.length = 1; // Reset path
    visited.clear();
    if (dfs(enteringVar, false)) {
      return path;
    }
    
    return [];
  };

  // Calcular theta (máximo que se puede asignar)
  const calculateTheta = (allocation: number[][], circuit: {row: number, col: number}[]): number => {
    let theta = Infinity;
    
    // Los índices pares (incluyendo 0) son positivos, impares son negativos
    for (let i = 1; i < circuit.length; i += 2) {
      const {row, col} = circuit[i];
      if (allocation[row][col] < theta) {
        theta = allocation[row][col];
      }
    }
    
    return theta;
  };

  // Actualizar asignación basada en el circuito
  const updateAllocation = (allocation: number[][], circuit: {row: number, col: number}[], theta: number): number[][] => {
    const newAllocation = allocation.map(row => [...row]);
    
    for (let i = 0; i < circuit.length; i++) {
      const {row, col} = circuit[i];
      if (i % 2 === 0) {
        newAllocation[row][col] += theta; // Positivo
      } else {
        newAllocation[row][col] -= theta; // Negativo
      }
    }
    
    return newAllocation;
  };

  // Método MODI completo
  const applyMODI = (initialAllocation: number[][]): MODIStep[] => {
    const modiSteps: MODIStep[] = [];
    let currentAllocation = initialAllocation.map(row => [...row]);
    let stepNumber = 1;
    let isOptimal = false;
    
    while (!isOptimal && stepNumber <= 10) { // Límite de seguridad
      const basicVars = findBasicVariables(currentAllocation);
      const {ui, vj} = calculateDualVariables(basicVars);
      const cij = calculateOpportunityCosts(ui, vj);
      const mostNegative = findMostNegative(cij, currentAllocation);
      
      const dualVariablesText = `ui = [${ui.map(u => u !== null ? u.toFixed(2) : '?').join(', ')}], vj = [${vj.map(v => v !== null ? v.toFixed(2) : '?').join(', ')}]`;
      
      if (!mostNegative) {
        isOptimal = true;
        modiSteps.push({
          step: stepNumber,
          ui,
          vj,
          cij,
          dualVariables: dualVariablesText,
          mostNegative: null,
          isOptimal: true,
          explanation: "La solución es óptima. Todos los costos de oportunidad para variables no básicas son no negativos (minimización) o no positivos (maximización)."
        });
      } else {
        const circuit = findCircuit(currentAllocation, mostNegative);
        
        if (circuit.length === 0) {
          modiSteps.push({
            step: stepNumber,
            ui,
            vj,
            cij,
            dualVariables: dualVariablesText,
            mostNegative,
            isOptimal: false,
            explanation: "No se pudo encontrar un circuito válido. El problema puede tener degeneración."
          });
          break;
        }
        
        const theta = calculateTheta(currentAllocation, circuit);
        const newAllocation = updateAllocation(currentAllocation, circuit, theta);
        
        modiSteps.push({
          step: stepNumber,
          ui,
          vj,
          cij,
          dualVariables: dualVariablesText,
          mostNegative,
          isOptimal: false,
          circuit: {
            path: circuit,
            theta,
            explanation: `Circuito: ${circuit.map(c => `(${c.row+1},${c.col+1})`).join(' → ')}, θ = ${theta}`
          },
          newAllocation,
          explanation: `Variable entrante: (${mostNegative.row+1}, ${mostNegative.col+1}) con costo de oportunidad ${mostNegative.value.toFixed(3)}`
        });
        
        currentAllocation = newAllocation;
        stepNumber++;
      }
    }
    
    return modiSteps;
  };

  // Algoritmo de la esquina noroeste con MODI
  const solveNorthwestCorner = (): void => {
    const { balanced }: BalanceCheck = checkBalance();
    if (!balanced) {
      alert('El problema debe estar balanceado (oferta total = demanda total)');
      return;
    }

    // Ejecutar algoritmo de Esquina Noroeste
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

    // Calcular costo inicial
    let initialCost = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        initialCost += allocation[i][j] * costs[i][j];
      }
    }

    // Aplicar MODI para optimizar
    const modiSteps = applyMODI(allocation);
    
    // Determinar si es óptima y obtener la solución final
    const isOptimal = modiSteps.length > 0 && modiSteps[modiSteps.length - 1].isOptimal;
    let finalAllocation = allocation;
    let finalCost = initialCost;
    
    if (modiSteps.length > 0) {
      const lastStep = modiSteps[modiSteps.length - 1];
      if (lastStep.newAllocation) {
        finalAllocation = lastStep.newAllocation;
      } else if (modiSteps.length > 1) {
        const secondLastStep = modiSteps[modiSteps.length - 2];
        if (secondLastStep.newAllocation) {
          finalAllocation = secondLastStep.newAllocation;
        }
      }
      
      // Recalcular costo final
      finalCost = 0;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          finalCost += finalAllocation[i][j] * costs[i][j];
        }
      }
    }

    setSolution({ 
      allocation, 
      totalCost: initialCost,
      isOptimal,
      modiSteps,
      finalAllocation,
      finalCost
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
    setShowMODI(false);
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

  const toggleShowProcess = (): void => {
    setShowProcess(!showProcess);
  };

  // Verificar balance
  const { totalSupply, totalDemand, balanced }: BalanceCheck = checkBalance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-indigo-100 p-6">
      {/* Elementos de fondo decorativos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(244, 63, 94, 0.7) 0%, rgba(99, 102, 241, 0.5) 40%, transparent 70%)'
          }}>
        </div>
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-2xl opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.6) 0%, rgba(236, 72, 153, 0.4) 50%, transparent 80%)'
          }}>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Calculator className="text-rose-600" />
            Método Esquina Noroeste + Optimización MODI
          </h1>
          <p className="text-lg text-gray-600">Algoritmo de Esquina Noroeste con Verificación de Optimalidad</p>
        </div>

        {/* Configuración */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración del Problema</h2>
          
          {/* Selector de objetivo */}
          <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-purple-50 rounded-lg border border-rose-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Objetivo de Optimización</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="objective"
                  value="minimize"
                  checked={objective === 'minimize'}
                  onChange={(e) => setObjective(e.target.value as 'minimize')}
                  className="text-rose-600"
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
                  className="text-rose-600"
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

        {/* Tabla de costos y datos */}
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
            onClick={solveNorthwestCorner}
            disabled={!balanced}
            className={`flex items-center gap-2 mx-auto px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform ${
              balanced 
                ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white hover:from-rose-700 hover:to-purple-700 hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            type="button"
          >
            <Play size={20} />
            Resolver con Esquina Noroeste + MODI
          </button>
        </div>

        {/* Resultados */}
        {solution && (
          <div className="space-y-6">
            {/* Indicador de optimalidad */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Estado de la Solución</h3>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  solution.isOptimal 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {solution.isOptimal ? <CheckCircle size={16} /> : <Target size={16} />}
                  {solution.isOptimal ? 'Solución Óptima' : 'Requiere Optimización'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Solución Inicial (Esquina Noroeste)</h4>
                  <p className="text-2xl font-bold text-blue-900">${solution.totalCost.toFixed(2)}</p>
                </div>
                {solution.finalCost !== undefined && solution.finalCost !== solution.totalCost && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Solución Optimizada (MODI)</h4>
                    <p className="text-2xl font-bold text-green-900">${solution.finalCost.toFixed(2)}</p>
                  </div>
                )}
                {solution.finalCost !== undefined && solution.finalCost !== solution.totalCost && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Mejora Obtenida</h4>
                    <p className="text-2xl font-bold text-purple-900">
                      ${(Math.abs(solution.finalCost - solution.totalCost)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones para mostrar procesos */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={toggleShowProcess}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                type="button"
              >
                <FileText size={18} />
                {showProcess ? 'Ocultar Proceso Esquina Noroeste' : 'Ver Proceso Esquina Noroeste'}
              </button>
              
              {solution.modiSteps && solution.modiSteps.length > 0 && (
                <button
                  onClick={() => setShowMODI(!showMODI)}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                  type="button"
                >
                  <TrendingUp size={18} />
                  {showMODI ? 'Ocultar Proceso MODI' : 'Ver Proceso MODI'}
                </button>
              )}
            </div>

            {/* Proceso paso a paso Esquina Noroeste */}
            {showProcess && steps.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Proceso Paso a Paso - Método Esquina Noroeste</h3>
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

            {/* Proceso MODI */}
            {showMODI && solution.modiSteps && solution.modiSteps.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Proceso de Optimización - Método MODI</h3>
                <div className="space-y-6">
                  {solution.modiSteps.map((modiStep: MODIStep, index: number) => (
                    <div key={index} className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/50">
                      {/* Header del paso MODI */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-emerald-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                          MODI Paso {modiStep.step}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {modiStep.explanation}
                        </span>
                        {modiStep.isOptimal && (
                          <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            ¡ÓPTIMA!
                          </span>
                        )}
                      </div>

                      {/* Variables duales */}
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Variables Duales:</h4>
                        <p className="text-sm text-blue-700 font-mono">{modiStep.dualVariables}</p>
                      </div>

                      {/* Tabla de costos de oportunidad */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Costos de Oportunidad (cij - ui - vj):</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-xs">
                            <thead>
                              <tr>
                                <th className="border border-gray-400 p-2 bg-gray-100">O/D</th>
                                {Array(cols).fill(null).map((_, j: number) => (
                                  <th key={j} className="border border-gray-400 p-2 bg-rose-100">
                                    D{j + 1}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array(rows).fill(null).map((_, i: number) => (
                                <tr key={i}>
                                  <td className="border border-gray-400 p-2 bg-rose-100 font-semibold text-center">
                                    O{i + 1}
                                  </td>
                                  {Array(cols).fill(null).map((_, j: number) => {
                                    const isBasic = solution.allocation[i][j] > 0;
                                    const isMostNegative = modiStep.mostNegative && 
                                      modiStep.mostNegative.row === i && modiStep.mostNegative.col === j;
                                    const isInCircuit = modiStep.circuit && 
                                      modiStep.circuit.path.some(p => p.row === i && p.col === j);
                                    
                                    return (
                                      <td key={j} className={`border border-gray-400 p-2 text-center ${
                                        isBasic 
                                          ? 'bg-gray-200 text-gray-500' 
                                          : isMostNegative
                                          ? 'bg-red-200 border-red-500 border-2'
                                          : isInCircuit
                                          ? 'bg-yellow-200'
                                          : modiStep.cij[i][j] < 0 && objective === 'minimize'
                                          ? 'bg-orange-100'
                                          : modiStep.cij[i][j] > 0 && objective === 'maximize'
                                          ? 'bg-orange-100'
                                          : 'bg-white'
                                      }`}>
                                        {isBasic ? '-' : modiStep.cij[i][j].toFixed(3)}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Variable entrante y circuito */}
                      {modiStep.mostNegative && !modiStep.isOptimal && (
                        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                          <h4 className="font-semibold text-orange-800 mb-2">Variable Entrante:</h4>
                          <p className="text-sm text-orange-700">
                            Celda ({modiStep.mostNegative.row + 1}, {modiStep.mostNegative.col + 1}) 
                            con costo de oportunidad: {modiStep.mostNegative.value.toFixed(3)}
                          </p>
                          
                          {modiStep.circuit && (
                            <div className="mt-3">
                              <h5 className="font-semibold text-orange-800 mb-1">Circuito de Mejora:</h5>
                              <p className="text-sm text-orange-700 font-mono">
                                {modiStep.circuit.explanation}
                              </p>
                              
                              {/* Tabla del circuito */}
                              <div className="mt-3 overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr>
                                      <th className="border border-gray-400 p-2 bg-gray-100">O/D</th>
                                      {Array(cols).fill(null).map((_, j: number) => (
                                        <th key={j} className="border border-gray-400 p-2 bg-rose-100">
                                          D{j + 1}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Array(rows).fill(null).map((_, i: number) => (
                                      <tr key={i}>
                                        <td className="border border-gray-400 p-2 bg-rose-100 font-semibold text-center">
                                          O{i + 1}
                                        </td>
                                        {Array(cols).fill(null).map((_, j: number) => {
                                          const circuitIndex = modiStep.circuit!.path.findIndex(p => p.row === i && p.col === j);
                                          const isInCircuit = circuitIndex !== -1;
                                          const sign = isInCircuit ? (circuitIndex % 2 === 0 ? '+' : '-') : '';
                                          const currentAllocation = solution.allocation[i][j];
                                          
                                          return (
                                            <td key={j} className={`border border-gray-400 p-1 text-center relative ${
                                              isInCircuit 
                                                ? circuitIndex % 2 === 0 
                                                  ? 'bg-green-200 border-green-500 border-2' 
                                                  : 'bg-red-200 border-red-500 border-2'
                                                : currentAllocation > 0
                                                ? 'bg-gray-100'
                                                : 'bg-white'
                                            }`}>
                                              {/* Costo en la esquina superior */}
                                              <div className="text-xs text-gray-600 absolute top-0 left-0 p-0.5 leading-none">
                                                {costs[i][j]}
                                              </div>
                                              
                                              {/* Asignación actual */}
                                              <div className="text-sm font-bold mt-2">
                                                {currentAllocation || '-'}
                                              </div>
                                              
                                              {/* Signo del circuito */}
                                              {isInCircuit && (
                                                <div className={`text-lg font-bold absolute bottom-0 right-0 p-0.5 leading-none ${
                                                  sign === '+' ? 'text-green-700' : 'text-red-700'
                                                }`}>
                                                  {sign}θ
                                                </div>
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              
                              <div className="mt-3 flex flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-green-200 border border-green-500 rounded"></div>
                                  <span>Celdas positivas (+θ)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 bg-red-200 border border-red-500 rounded"></div>
                                  <span>Celdas negativas (-θ)</span>
                                </div>
                                <div className="text-sm font-semibold">
                                  θ = {modiStep.circuit.theta}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Nueva asignación si existe */}
                      {modiStep.newAllocation && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Nueva Asignación:</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                              <thead>
                                <tr>
                                  <th className="border border-gray-400 p-2 bg-gray-100">O/D</th>
                                  {Array(cols).fill(null).map((_, j: number) => (
                                    <th key={j} className="border border-gray-400 p-2 bg-rose-100">
                                      D{j + 1}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {Array(rows).fill(null).map((_, i: number) => (
                                  <tr key={i}>
                                    <td className="border border-gray-400 p-2 bg-rose-100 font-semibold text-center">
                                      O{i + 1}
                                    </td>
                                    {Array(cols).fill(null).map((_, j: number) => {
                                      const oldValue = solution.allocation[i][j];
                                      const newValue = modiStep.newAllocation![i][j];
                                      const hasChanged = oldValue !== newValue;
                                      
                                      return (
                                        <td key={j} className={`border border-gray-400 p-2 text-center font-mono ${
                                          newValue > 0 
                                            ? hasChanged 
                                              ? 'bg-green-100 text-green-800 font-bold'
                                              : 'bg-blue-100 text-blue-800 font-bold'
                                            : 'bg-gray-50 text-gray-400'
                                        }`}>
                                          {newValue || 0}
                                          {hasChanged && (
                                            <div className="text-xs text-gray-600">
                                              (era: {oldValue})
                                            </div>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solución final */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Solución Final</h3>
              
              {/* Indicador del método usado */}
              <div className="mb-4 p-3 bg-rose-50 rounded-lg border-l-4 border-rose-500">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600" />
                  <span className="text-sm font-medium text-rose-800">
                    Solución inicial obtenida con el Método de la Esquina Noroeste
                    {solution.isOptimal ? '. Optimizada con MODI.' : '. Requirió optimización MODI.'}
                  </span>
                </div>
              </div>
              
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-2 border-gray-300 p-3 bg-gray-50 text-sm font-semibold">Asignación Final</th>
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
                        {Array(cols).fill(null).map((_, j: number) => {
                          const finalAllocation = solution.finalAllocation || solution.allocation;
                          const allocation = finalAllocation[i][j];
                          return (
                            <td key={j} className={`border-2 border-gray-300 p-3 text-center font-mono ${
                              allocation > 0 
                                ? 'bg-green-100 text-green-800 font-bold' 
                                : 'bg-gray-50 text-gray-400'
                            }`}>
                              {allocation || 0}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-rose-100 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {objective === 'minimize' ? 'Costo Total Óptimo' : 'Utilidad Total Óptima'}: 
                    ${(solution.finalCost || solution.totalCost).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {solution.isOptimal ? 'Solución verificada como óptima' : 'Solución mejorada con MODI'}
                  </div>
                </div>
              </div>

              {/* Detalle del cálculo */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Detalle del Cálculo Final:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {(solution.finalAllocation || solution.allocation).map((row: number[], i: number) => 
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
              <div className="mt-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
                <h4 className="font-semibold text-rose-800 mb-2">🎯 Sobre el Método de la Esquina Noroeste:</h4>
                <div className="text-sm text-rose-700 space-y-1">
                  <p><strong>1. Inicio:</strong> Se comienza en la celda superior izquierda (esquina noroeste).</p>
                  <p><strong>2. Asignación:</strong> Se asigna el mínimo entre la oferta de la fila y la demanda de la columna.</p>
                  <p><strong>3. Movimiento:</strong> Se elimina la fila o columna satisfecha y se mueve hacia la derecha o abajo.</p>
                  <p><strong>4. Continuación:</strong> Se repite hasta satisfacer todas las restricciones.</p>
                  <p><strong>5. Optimización MODI:</strong> Se verifica y mejora la solución inicial si es necesario.</p>
                </div>
              </div>

              {/* Explicación del método MODI */}
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-2">🔧 Sobre el Método MODI:</h4>
                <div className="text-sm text-emerald-700 space-y-1">
                  <p><strong>1. Variables Duales:</strong> Se calculan ui y vj donde ui + vj = cij para variables básicas.</p>
                  <p><strong>2. Costos de Oportunidad:</strong> Para variables no básicas: cij - ui - vj</p>
                  <p><strong>3. Criterio de Optimalidad:</strong> {objective === 'minimize' ? 'Todos los costos ≥ 0' : 'Todos los costos ≤ 0'}</p>
                  <p><strong>4. Mejora:</strong> Se forma un circuito para introducir la variable con {objective === 'minimize' ? 'mayor valor negativo' : 'mayor valor positivo'}.</p>
                  <p><strong>5. Nuevo punto:</strong> Se calcula θ como el mínimo de las variables que salen del circuito.</p>
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