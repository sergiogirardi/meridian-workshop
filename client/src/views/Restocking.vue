<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <!-- Budget input -->
    <div class="budget-card">
      <div class="budget-row">
        <div class="budget-field">
          <label class="budget-label">{{ t('restocking.budgetLabel') }}</label>
          <div class="budget-input-wrapper">
            <span class="currency-prefix">$</span>
            <input
              v-model.number="budget"
              type="number"
              min="0"
              step="1000"
              class="budget-input"
              :placeholder="t('restocking.budgetPlaceholder')"
              @keyup.enter="loadData"
            />
          </div>
        </div>
        <button class="btn-primary" :disabled="loading || !budget" @click="loadData">
          <span v-if="loading">...</span>
          <span v-else>{{ t('restocking.getRecommendations') }}</span>
        </button>
      </div>
    </div>

    <!-- Empty / loading / error -->
    <div v-if="!result && !loading && !error" class="empty-state">
      {{ t('restocking.noBudget') }}
    </div>
    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Results -->
    <template v-if="result && !loading">
      <!-- Summary stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.stats.itemsRecommended') }}</div>
          <div class="stat-value">{{ result.items_count }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.stats.totalCost') }}</div>
          <div class="stat-value">${{ fmt(result.total_estimated_cost) }}</div>
        </div>
        <div class="stat-card" :class="{ over: budgetUsedPct > 100 }">
          <div class="stat-label">{{ t('restocking.stats.budgetUsed') }}</div>
          <div class="stat-value">${{ fmt(result.total_estimated_cost) }}</div>
          <div class="stat-sub">{{ budgetUsedPct }}% of ${{ fmt(budget) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('restocking.stats.budgetRemaining') }}</div>
          <div class="stat-value">${{ fmt(Math.max(budget - result.total_estimated_cost, 0)) }}</div>
        </div>
      </div>

      <!-- Budget progress bar -->
      <div class="budget-bar-wrap">
        <div class="budget-bar">
          <div
            class="budget-bar-fill"
            :style="{ width: Math.min(budgetUsedPct, 100) + '%' }"
            :class="{ over: budgetUsedPct > 90 }"
          ></div>
        </div>
        <span class="budget-bar-label">{{ budgetUsedPct }}% allocated</span>
      </div>

      <!-- Recommendations table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('restocking.title') }}</h3>
        </div>

        <div v-if="!result.recommendations.length" class="no-data">
          {{ t('restocking.noItems') }}
        </div>

        <div v-else class="table-container">
          <table class="restocking-table">
            <thead>
              <tr>
                <th>{{ t('restocking.table.rank') }}</th>
                <th>{{ t('restocking.table.item') }}</th>
                <th>{{ t('restocking.table.sku') }}</th>
                <th>{{ t('restocking.table.warehouse') }}</th>
                <th class="num">{{ t('restocking.table.currentStock') }}</th>
                <th class="num">{{ t('restocking.table.reorderPoint') }}</th>
                <th class="num">{{ t('restocking.table.recommendedQty') }}</th>
                <th class="num">{{ t('restocking.table.estimatedCost') }}</th>
                <th>{{ t('restocking.table.demandTrend') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rec, i) in result.recommendations" :key="rec.item_id">
                <td class="rank">{{ i + 1 }}</td>
                <td>
                  <div class="item-name">{{ rec.name }}</div>
                  <div class="item-category">{{ rec.category }}</div>
                </td>
                <td class="mono">{{ rec.sku }}</td>
                <td>{{ rec.warehouse }}</td>
                <td class="num">
                  <span class="stock-low">{{ rec.quantity_on_hand }}</span>
                </td>
                <td class="num">{{ rec.reorder_point }}</td>
                <td class="num"><strong>{{ rec.recommended_qty }}</strong></td>
                <td class="num">${{ fmt(rec.estimated_cost) }}</td>
                <td>
                  <span v-if="rec.demand_trend" :class="trendClass(rec.demand_trend)">
                    {{ trendLabel(rec.demand_trend) }}
                  </span>
                  <span v-else class="trend-none">—</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="7" class="total-label">Total estimated spend</td>
                <td class="num total-value">${{ fmt(result.total_estimated_cost) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'Restocking',
  setup() {
    const { t } = useI18n()
    const { selectedLocation, selectedCategory, getCurrentFilters } = useFilters()

    const budget = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const result = ref(null)

    const budgetUsedPct = computed(() => {
      if (!result.value || !budget.value) return 0
      return Math.round((result.value.total_estimated_cost / budget.value) * 100)
    })

    const loadData = async () => {
      if (!budget.value || budget.value <= 0) return
      try {
        loading.value = true
        error.value = null
        const filters = getCurrentFilters()
        result.value = await api.getRestockingRecommendations(filters, budget.value)
      } catch (err) {
        error.value = t('common.error') + ': ' + err.message
      } finally {
        loading.value = false
      }
    }

    watch([selectedLocation, selectedCategory], () => {
      if (result.value) loadData()
    })

    const fmt = (num) =>
      (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const trendClass = (trend) => {
      if (!trend) return ''
      const t = trend.toLowerCase()
      if (t === 'increasing') return 'trend-up'
      if (t === 'decreasing') return 'trend-down'
      return 'trend-stable'
    }

    const trendLabel = (trend) => {
      if (!trend) return '—'
      const map = { increasing: '↑ Increasing', stable: '→ Stable', decreasing: '↓ Decreasing' }
      return map[trend.toLowerCase()] || trend
    }

    return {
      t, budget, loading, error, result, budgetUsedPct,
      loadData, fmt, trendClass, trendLabel
    }
  }
}
</script>

<style scoped>
.restocking { padding: 0; }

.budget-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.budget-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.budget-field { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 200px; }
.budget-label { font-size: 0.875rem; font-weight: 600; color: #374151; }

.budget-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.currency-prefix {
  padding: 0.625rem 0.75rem;
  background: #f9fafb;
  border-right: 1px solid #d1d5db;
  color: #6b7280;
  font-weight: 600;
}

.budget-input {
  border: none;
  outline: none;
  padding: 0.625rem 0.75rem;
  font-size: 1rem;
  width: 100%;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 4px solid #3b82f6;
}
.stat-card.over { border-left-color: #ef4444; }
.stat-label { font-size: 0.8rem; color: #64748b; margin-bottom: 0.25rem; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
.stat-sub { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }

.budget-bar-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.budget-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}
.budget-bar-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.4s ease;
}
.budget-bar-fill.over { background: #ef4444; }
.budget-bar-label { font-size: 0.8rem; color: #64748b; white-space: nowrap; }

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.card-header { margin-bottom: 1.25rem; }
.card-title { font-size: 1.1rem; font-weight: 600; color: #0f172a; margin: 0; }

.no-data { text-align: center; padding: 2rem; color: #94a3b8; }

.restocking-table { width: 100%; border-collapse: collapse; }
.restocking-table th {
  background: #f8fafc;
  padding: 0.65rem 0.75rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}
.restocking-table th.num { text-align: right; }
.restocking-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  vertical-align: middle;
}
.restocking-table td.num { text-align: right; }
.restocking-table tr:hover { background: #f8fafc; }

.rank { font-weight: 700; color: #94a3b8; width: 32px; }
.item-name { font-weight: 600; color: #0f172a; }
.item-category { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }
.mono { font-family: monospace; font-size: 0.82rem; color: #64748b; }
.stock-low { color: #dc2626; font-weight: 600; }

.trend-up { color: #16a34a; font-weight: 600; }
.trend-down { color: #dc2626; font-weight: 600; }
.trend-stable { color: #ca8a04; font-weight: 600; }
.trend-none { color: #cbd5e1; }

tfoot .total-row td {
  padding: 0.75rem;
  border-top: 2px solid #e2e8f0;
  font-size: 0.875rem;
}
.total-label { text-align: right; font-weight: 600; color: #374151; }
.total-value { font-weight: 700; color: #0f172a; font-size: 1rem; }

.loading { text-align: center; padding: 3rem; color: #64748b; }
.error { background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
</style>
