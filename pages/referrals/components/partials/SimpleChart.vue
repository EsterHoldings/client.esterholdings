<template>
  <div class="chart-wrapper">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Item {
  label: string;
  value: number;
}

const props = defineProps<{ data: Item[] }>();

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: any = null;
let echartsLib: any = null;

const initChart = async () => {
  if (!chartRef.value) return;
  if (!echartsLib) {
    echartsLib = await import("echarts");
  }
  if (!chartInstance) {
    chartInstance = echartsLib.init(chartRef.value);
  }
  renderChart();
};

const renderChart = () => {
  if (!chartInstance) return;
  const labels = props.data.map(d => d.label);
  const values = props.data.map(d => d.value);
  chartInstance.setOption({
    grid: { left: 6, right: 6, top: 10, bottom: 20, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(0,0,0,0.7)",
      borderColor: "rgba(255,255,255,0.08)",
      textStyle: { color: "var(--ui-text-main)" },
    },
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.15)" } },
      axisLabel: { color: "var(--ui-text-secondary)", fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
      axisLabel: { color: "var(--ui-text-secondary)", fontSize: 10 },
    },
    series: [
      {
        type: "line",
        smooth: true,
        data: values,
        symbolSize: 6,
        itemStyle: { color: "var(--ui-primary-main)" },
        lineStyle: { width: 3, color: "var(--ui-primary-main)" },
        areaStyle: {
          color: new echartsLib.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(0, 145, 255, 0.25)" },
            { offset: 1, color: "rgba(0, 145, 255, 0)" },
          ]),
        },
      },
    ],
  });
};

onMounted(() => {
  initChart();
  window.addEventListener("resize", resizeHandler);
});

const resizeHandler = () => chartInstance?.resize();

watch(
  () => props.data,
  () => {
    if (chartInstance) {
      renderChart();
    } else {
      initChart();
    }
  },
  { deep: true },
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeHandler);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.chart-wrapper {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px;
}

.chart {
  width: 100%;
  height: 240px;
}
</style>
