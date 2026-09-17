"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTasks } from "@/hooks/useTasks";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ListTodo,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const chartConfig = {
  openTasks: {
    label: "Abertas",
    color: "#3b82f6",
  },
  doneTasks: {
    label: "Concluídas",
    color: "#22c55e",
  },
  canceledTasks: {
    label: "Canceladas",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function TaskMetrics() {
  const { fetchMetrics, metrics, loadingMetrics, errorMetrics } = useTasks();
  const [expandDetails, setExpandDetails] = useState<boolean>(() => {
    return localStorage.getItem("expand-details") === "isExpanded";
  });

  const toggleExpandDetails = () => {
    setExpandDetails((prev) => {
      const expand = !prev;
      localStorage.setItem(
        "expand-details",
        expand ? "isExpanded" : "notExpanded",
      );
      return expand;
    });
  };

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Preenchimento dos 12 meses
  const formattedData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1;
      const found = metrics.find((item) => item.month === monthNumber);

      return {
        month: monthNumber,
        monthName: MONTH_NAMES[index],
        totalTasks: found ? found.totalTasks : 0,
        openTasks: found ? found.openTasks : 0,
        doneTasks: found ? found.doneTasks : 0,
        canceledTasks: found ? found.canceledTasks : 0,
      };
    });
  }, [metrics]);

  // Cálculos consolidados do ano
  const summary = useMemo(() => {
    return formattedData.reduce(
      (acc, curr) => ({
        total: acc.total + curr.totalTasks,
        open: acc.open + curr.openTasks,
        done: acc.done + curr.doneTasks,
        canceled: acc.canceled + curr.canceledTasks,
      }),
      { total: 0, open: 0, done: 0, canceled: 0 },
    );
  }, [formattedData]);

  const completionRate =
    summary.total > 0 ? Math.round((summary.done / summary.total) * 100) : 0;

  if (loadingMetrics) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (errorMetrics) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center text-red-500">
        <p>{errorMetrics}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <div className="max-w-400 mx-auto space-y-6">
        {/* CARDS DE RESUMO ANUAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Criadas
              </CardTitle>
              <ListTodo className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-slate-400">Tarefas no ano corrente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Abertas
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {summary.open}
              </div>
              <p className="text-xs text-slate-400">Pendente de conclusão</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Concluídas
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.done}
              </div>
              <p className="text-xs text-slate-400">Finalizadas com sucesso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Canceladas
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.canceled}
              </div>
              <p className="text-xs text-slate-400">
                Descartadas ou canceladas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Taxa de Conclusão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {completionRate}%
              </div>
              <p className="text-xs text-slate-400">
                Proporção concluída/total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* GRÁFICO BAR CHART */}
        <Card className="w-full overflow-hidden">
          <CardHeader>
            <CardTitle>Visão Mensal Comparativa</CardTitle>
            <CardDescription>
              Distribuição do status das tarefas ao longo do ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart accessibilityLayer data={formattedData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="monthName"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />

                  <Bar
                    dataKey="openTasks"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="doneTasks"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="canceledTasks"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* TABELA DE DETALHAMENTO MENSAL */}
        <div className="relative">
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`relative w-full ${expandDetails ? "h-full" : "h-20"}`}
              >
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                  <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Mês</th>
                      <th className="px-4 py-3 text-center">Total</th>
                      <th className="px-4 py-3 text-center">Abertas</th>
                      <th className="px-4 py-3 text-center">Concluídas</th>
                      <th className="px-4 py-3 text-center">Canceladas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {formattedData.map((row) => (
                      <tr
                        key={row.month}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <td className="px-4 py-3 font-medium">
                          {row.monthName}
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {row.totalTasks}
                        </td>
                        <td className="px-4 py-3 text-center text-blue-600">
                          {row.openTasks}
                        </td>
                        <td className="px-4 py-3 text-center text-green-600">
                          {row.doneTasks}
                        </td>
                        <td className="px-4 py-3 text-center text-red-600">
                          {row.canceledTasks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <button
            onClick={toggleExpandDetails}
            className={`flex items-center justify-center absolute border-2 border-slate-600 left-193  ${expandDetails ? "top-157" : "top-33"} rounded-full w-10 h-10 bg-white opacity-50 backdrop-blur shadow-2xl`}
          >
            <ChevronDown
              size={28}
              className={`text-slate-600 hover:text-slate-900 transition-transform hover:scale-110 ${expandDetails ? "rotate-180 duration-1000" : "duration-1000"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
