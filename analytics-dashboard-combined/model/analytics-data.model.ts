/**
 * Analytics Dashboard — ISC-ALIGNED DATA CONTRACT (UX-846)
 *
 * SPEC, not the final files. Shaped to match what the India team shipped for
 * Engagement Phase 1 on ISC `master` (post-PR #3786 "Analytics-Dashboard-Main-V3",
 * verified 2026-06-23) so a Distribution module slots beside Engagement using the
 * IDENTICAL architecture. Each section names its real ISC target path.
 *
 * Engagement is REUSED (already shipped) — do NOT redefine its DTOs. Distribution is
 * greenfield (nothing on master yet) — define it here in ISC's exact conventions.
 *
 * ISC conventions being matched (src code, master):
 *   - DTOs in `src/app/shared/dto/`, camelCase fields, `{data, pagination, summary?}` envelope.
 *   - Service `extends ApiService` (src/app/core/services/), returns Observable, endpoints
 *     `brands/{brandHash}/nodes/{nodeHash}/analytics/{resource}`, params built via HttpParams.
 *   - State `TableStateService` (src/app/analytic-dashboard/services/): BehaviorSubject +
 *     combineLatest → filters$; buildApiParams() emits snake_case. No NgRx, no signals.
 *   - NgModule-declared, default change detection, ECharts.
 *
 * BUILD POSTURE (decided 2026-06-23): MATCH India phase-1 EXACTLY for consistency + low review
 *   friction — default change detection, NgModule-declared, custom CSS spinner + toast, silent
 *   error swallow (`error: () => { this.isLoading = false; }`), NO OnPush/signals. Service calls
 *   are `http.get<any[]>(url, …)` then cast to the DTOs below — exactly like
 *   DashboardPromotionTableService.getPromotionalData → `res as PromotionTableDto`. The DTOs
 *   themselves stay strictly typed (India's shared/dto DTOs are typed too; the `any` lives at the
 *   service-call/component layer, not the contract).
 *
 * Prototype provenance: field shapes harvested from mydarndest-playground data layer; the
 * raw snake_case inventory is in git history. Mapping comments below: `// proto: <name>`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** In ISC: `import { Observable } from 'rxjs'`. Local placeholder so this spec tsc's standalone. */
type Observable<T> = { subscribe(observer?: unknown): { unsubscribe(): void } };
/** In ISC: Angular `Signal<T>` from '@angular/core'. Local placeholder so this spec tsc's standalone. */
type Signal<T> = () => T;

export type IsoDate = string; // 'YYYY-MM-DD'
export type Hash = string;

/* ============================================================================
 * §A  ENGAGEMENT — EXISTING, REUSE (do NOT redefine)
 * Canonical source: src/app/shared/dto/promotion-table.dto.ts (+ summary/detail dtos).
 * Listed for reference + cross-domain consistency only.
 * ========================================================================== */

/**
 * SHIPPED on master. Import from 'src/app/shared/dto/promotion-table.dto'. Reference only.
 * Score weighting per IN-267: totalScore = inViewScore + clickScore(clicks×10) + addToListScore(adds×50).
 * OPEN (India): `addToList` vs `addToListCount` — two distinct number fields, purpose of the former TBD.
 */
export interface PromotionRef {
  promotionId: number;
  promotionName: string;
  categoryHash: Hash;
  categoryName: string;
  storeName: string;
  views: number;
  clicks: number;
  addToListCount: number;
  totalScore: number;
  inViewScore: number;
  clickScore: number;
  addToListScore: number;
  percentile: number;
  ctr: number;
  // …full field set lives in the real DTO (cardTitle, couponType, firstActivityDate, etc.)
}

/** SHIPPED envelope — reuse for ALL analytics tables (Distribution included). */
export interface Pagination {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number;
  to: number;
  hasMore: boolean;
}

/** SHIPPED V3 (IN-267) — axis scaling source. Reuse for distribution score charts. */
export interface Summary {
  maxScore: number;
  minScore: number;
  avgScore: number;
}

/** Generic table envelope matching PromotionTableDto. Reuse across domains. */
export interface AnalyticsTableDto<T> {
  data: T[];
  pagination: Pagination;
  summary?: Summary;
}

/* ============================================================================
 * §B  DISTRIBUTION DTOs — NEW
 * Target: src/app/shared/dto/distribution-*.dto.ts  (camelCase, like Promotion).
 * STATUS legend: default = mock in prototype; `real` = Pulse overlay (SEG subset);
 *   `derived` = computed; `GATED` = shape provisional, see §F.
 * ========================================================================== */

/* ---- B1. Traffic Share ---- target: distribution-traffic.dto.ts ------------ */

/** Atomic per store × week.  proto: trafficRecords */
export interface TrafficStoreRow {
  id: string;
  storeId: Hash; // proto: store_id
  weekId: string; // proto: week_id
  retailerVisits: number; // proto: retailer_visits
  compVisits: number; // proto: comp_visits
  totalMarketVisits: number; // derived; proto: total_market_visits
  retailerShare: number; // 0–100, 1dp; proto: retailer_share
  hhi: number;
  primaryThreat: string; // proto: primary_threat
  primaryThreatAddress: string; // proto: primary_threat_address
  alertType: 'opportunity' | 'critical' | 'none'; // proto: alert_type
  group: 'green' | 'amber' | 'red';
}

/** Entity/window roll-up — all derived.  proto: DistributionData traffic aggregate */
export interface TrafficShareSummary {
  retailerTrafficShare: number;
  shareChangePp: number;
  storesOutperforming: number;
  storesTotal: number;
  retailerGrowthRate: number;
  compGrowthRate: number;
  growthAdvantage: number;
  highlyConcentratedCount: number;
  moderatelyConcentratedCount: number;
}

/** Derived per-week trend point — drives the Traffic Share area chart.  proto: getTrafficShareMetrics().trend */
export interface TrafficTrendPoint {
  weekId: string; // proto: week
  retailerShare: number; // 0–100, 1dp; proto: retailer_share
  compShare: number; // 0–100, 1dp; proto: comp_share
  retailerVisits: number; // proto: retailer_visits
  compVisits: number; // proto: comp_visits
}

/** By-store leaderboard grain — DISTINCT from atomic TrafficStoreRow.  proto: getTrafficShareMetrics().storeLeaderboard */
export interface TrafficStoreLeaderboardRow {
  storeId: string; // proto: store_id ('store-' stripped)
  city: string;
  wk3Share: number; // window-START week share (legacy 3-wk naming); proto: wk3_share
  wk2Share: number; // LATEST week share; proto: wk2_share
  changePp: number; // pp delta latest − start; proto: change_pp
  alertType: 'opportunity' | 'critical' | 'none'; // proto: alert_type
  hhi: number;
  hhiStatus: 'Highly Concentrated' | 'Moderately Concentrated'; // proto: hhi_status
  primaryThreat: string; // proto: primary_threat
  primaryThreatAddress: string; // proto: primary_threat_address
  group: 'green' | 'amber' | 'red';
}

/* ---- B2. Competitor Crossover ---- target: distribution-crossover.dto.ts --- */

/** Cohort buckets: zeroPrev=New, oneThree=Returning, fourPlus=Loyal.  proto: crossoverRecords */
export interface CrossoverRow {
  id: string;
  competitorName: string; // proto: competitor_name
  competitorStoreAddress: string; // proto: competitor_store_address
  weekId: string;
  crossoverPct: number; // proto: crossover_pct
  crossoverVisitsZeroPrev: number; // New;       proto: crossover_visits_zero_prev
  crossoverVisitsOneThree: number; // Returning; proto: crossover_visits_one_three
  crossoverVisitsFourPlus: number; // Loyal;     proto: crossover_visits_four_plus
  trend?: number[]; // derived — per-week share series over window (per-window ranking; Adam-locked top-N + All Other)
}

/* ---- B3. Paid Media ---- target: distribution-media.dto.ts ----------------- */

/** Atomic per store × week × creative.  proto: mediaRecords */
export interface MediaStoreRow {
  id: string;
  storeId: Hash;
  weekId: string;
  impressions: number; // GATED — synthetic except ~25 SEG stores (real Pulse reporting)
  clicks: number; // GATED — synthetic except SEG subset
  ctr: number; // derived (%, 2dp)
  costPerImpression: number; // derived (4dp); proto: cost_per_impression
  budgetAllocated: number; // proto: budget_allocated
  grossVisits: number; // proto: gross_visits
  costPerVisit: number | null; // derived; proto: cost_per_visit
  visitsPerThousand: number; // derived; proto: visits_per_thousand
  spend: number; // alias of budgetAllocated
  cpm: number; // derived
  cpc: number; // derived
  status: 'Live' | 'Paused' | 'Ended';
  creativeId: string; // proto: creative_id
}

export interface MediaSummary {
  impressions: number;
  clicks: number;
  ctr: number; // derived
  budget: number;
  grossVisits: number;
  costPerVisit: number; // derived
  visitsPerThousand: number; // derived
  spend: number;
  cpm: number; // derived
  cpc: number; // derived
}

export interface Flight {
  start: IsoDate;
  end: IsoDate;
  budget: number;
}

/** Static per campaign. `real` fields overlaid from Pulse for SEG.  proto: creativeRecords */
export interface CreativeRow {
  creativeId: string;
  retailerId: Hash | null; // real
  storeGroup: string[]; // proto: store_group
  creativeType: 'gif' | 'jpeg' | 'video'; // real
  dimensions: string; // real — "728x90"
  width: number | null; // real
  height: number | null; // real
  targetUrl: string; // proto: target_url
  fileUrl: string; // real; proto: file_url
  dateRangeStart: IsoDate; // real
  dateRangeEnd: IsoDate; // real
  label: string; // real
  channel: 'display' | 'youtube' | 'meta'; // real
  pulseType: 'BannerAd' | 'VideoAd' | 'MetaSingleImageVideoAd'; // real; proto: pulse_type
  group: string; // real — Pulse campaign Group
  kpi: 'awareness' | 'click_and_traffic' | 'conversions' | 'video'; // real
  kpiMetric: 'ctr' | 'cpa' | 'vcr'; // real; proto: kpi_metric
  kpiValue: number; // real; proto: kpi_value
  status: 'Live' | 'Paused' | 'Ended'; // real
  statusOn: 'on' | 'off'; // real; proto: status_on
  landingPage: string; // real; proto: landing_page (alias of targetUrl)
  frequencyAmount: number | null; // real; proto: frequency_amount
  frequencyInterval: 'hour' | 'day' | null; // real; proto: frequency_interval
  pacing: 'evenly'; // real
  flights: Flight[]; // real
  realPulseSource: { campaignId: string; name: string } | null; // real provenance; proto: real_pulse_source
}

/* ---- B4. Observed Visitation ---- target: distribution-visitation.dto.ts --- */

/** proto: visitationRecords. Lags ~21d (see Freshness). */
export interface VisitationStoreRow {
  id: string;
  storeId: Hash;
  weekId: string;
  grossVisits: number;
  visitsZeroPrev: number; // New
  visitsOneThreePrev: number; // Returning
  visitsFourPlusPrev: number; // Loyal
  costPerVisit: number; // derived
  conversions: number; // alias of grossVisits
  cpa: number; // alias of costPerVisit
}

/* ---- B5. Demographics ---- target: distribution-demographics.dto.ts -------- */

export interface DemoBucket {
  label: string;
  value: number; // 0–100 implied %
}

export type DemoDimensionKey =
  | 'age'
  | 'gender'
  | 'children'
  | 'householdIncome'
  | 'householdSize'
  | 'homeowner'
  | 'maritalStatus'
  | 'netWorth';

/** Panel-level only. Per-store split is GATED (§F).  proto: demographics */
export interface Demographics {
  period: string;
  retailer: string | null;
  age: DemoBucket[];
  gender: DemoBucket[];
  children: DemoBucket[];
  householdIncome: DemoBucket[]; // proto: household_income
  householdSize: DemoBucket[]; // proto: household_size
  homeowner: DemoBucket[];
  maritalStatus: DemoBucket[]; // proto: marital_status
  netWorth: DemoBucket[]; // proto: net_worth
}

/* ---- B6. Freshness (two-speed data) ---- shared, computed client-side ------ */

export type FreshnessStatus = 'available' | 'pending' | 'partial' | 'future' | 'out-of-bounds';

/** Media ~real-time; visitation/traffic/crossover/demographics lag ~21d. Gates UI banners. */
export interface VisitationFreshness {
  status: FreshnessStatus;
  lagDays: number;
  pendingCount: number | null;
  throughLabel: string | null;
  lastSettledId: string | null;
  lastSettledLabel: string | null;
  nextAvailableLabel: string | null;
  nextDaysUntil: number | null;
  weekLabel: string | null;
  periodEndLabel: string | null;
  availableOnLabel: string | null;
  daysUntil: number | null;
  inProgress: boolean;
}

/* ============================================================================
 * §C  API PARAMS — NEW   target: dashboard-distribution.service.ts (interface)
 * Mirrors PromotionEngagementParams: snake_case, optional keys dropped when falsy.
 * ========================================================================== */

export interface DistributionEngagementParams {
  start_date?: IsoDate;
  end_date?: IsoDate;
  week_id?: string;
  campaign_id?: string;
  competitor?: string;
  store_tier?: 'green' | 'amber' | 'red'; // distribution-specific dimension
  metric?: 'share' | 'visits'; // Traffic Share lens
  cohort?: 'all' | 'new' | 'returning' | 'loyal'; // frequency lens
  dim?: DemoDimensionKey; // demographics dimension
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  // brand/node are PATH args (b,n on the service method) — NOT query params; entity flows via sharedContext$.
}

/* ============================================================================
 * §D  SERVICE — NEW   target: src/app/core/services/dashboard-distribution.service.ts
 * Impl mirrors DashboardPromotionTableService EXACTLY:
 *   @Injectable({providedIn:'root'})
 *   export class DashboardDistributionService extends ApiService {
 *     protected endpoint = 'brands';
 *     constructor(protected readonly http: HttpClient){ super(http); }
 *     <method> { const url = `${this.getEndpoint()}/${brandHash}/nodes/${nodeHash}/analytics/...`;
 *               return this.http.get<...>(url, { params: this.buildParams(filters) }); }
 *   }
 * Endpoints reshape the tracker's flat /api/distribution/* into ISC's brand/node-scoped pattern.
 * ========================================================================== */

export interface DashboardDistributionApi {
  /** GET …/analytics/distribution/traffic-share/by-store — leaderboard grain (NOT atomic TrafficStoreRow) */
  getTrafficByStore(b: Hash, n: Hash, f?: DistributionEngagementParams): Observable<AnalyticsTableDto<TrafficStoreLeaderboardRow>>;
  /** GET …/analytics/distribution/traffic-share/summary — hero roll-up (cannot derive from a paginated table) */
  getTrafficSummary(b: Hash, n: Hash, f?: DistributionEngagementParams): Observable<TrafficShareSummary>;
  /** GET …/analytics/distribution/traffic-share/trend — per-week area-chart series */
  getTrafficTrend(b: Hash, n: Hash, f?: DistributionEngagementParams): Observable<TrafficTrendPoint[]>;
  /** GET …/analytics/distribution/cross-shopping */
  getCrossover(b: Hash, n: Hash, f?: DistributionEngagementParams): Observable<AnalyticsTableDto<CrossoverRow>>;
  /** GET …/analytics/distribution/paid-media/by-store */
  getMediaByStore(b: Hash, n: Hash, f?: DistributionEngagementParams): Observable<AnalyticsTableDto<MediaStoreRow>>;
  /** GET …/analytics/distribution/paid-media/creatives */
  getCreatives(b: Hash, n: Hash, f?: DistributionEngagementParams): Observable<AnalyticsTableDto<CreativeRow>>;
  /** GET …/analytics/distribution/observed-visits/by-store */
  getVisitationByStore(b: Hash, n: Hash, f?: DistributionEngagementParams): Observable<AnalyticsTableDto<VisitationStoreRow>>;
  /** GET …/analytics/distribution/demographics/current */
  getDemographics(b: Hash, n: Hash, f?: DistributionEngagementParams): Observable<Demographics>;
}

/* ============================================================================
 * §E  STATE — NEW   target: src/app/analytic-dashboard/services/distribution-state.service.ts
 * Impl uses Angular SIGNALS (ratified 2026-06-24): signal() per dist-own dimension +
 * computed() fetchKey; shared entity/date bridged from phase-1's RxJS via toSignal().
 * buildApiParams() → snake_case; page resets to 1 on any filter change.
 * ========================================================================== */

export interface DistributionState {
  // Angular signals (ratified). Pure consumer of shared entity+date from phase-1 — no setDateRange/setEntityFilters here.
  readonly sharedContext: Signal<{ brandHash?: Hash; nodeHash?: Hash; startDate?: string; endDate?: string }>;
  readonly fetchKey: Signal<unknown>; // computed(sharedContext + distFilters) — refetch trigger; NOT trendWindow
  readonly trendWindow: Signal<number>; // VIEW-ONLY (P1-4) — slices the chart, never refetches
  setStoreTier(tier: DistributionEngagementParams['store_tier']): void;
  setMetric(metric: DistributionEngagementParams['metric']): void;
  setCohort(cohort: DistributionEngagementParams['cohort']): void;
  setCampaign(campaignId: string): void;
  setCompetitor(name: string): void;
  setSort(sortBy: string, sortDirection: 'asc' | 'desc'): void;
  setPage(page: number): void;
  setLimit(limit: number): void;
  setTrendWindow(weeks: number): void; // VIEW-ONLY trendWindow setter (P1-4)
  buildApiParams(): DistributionEngagementParams;
}

/* ============================================================================
 * §F  GATED SLICES — resolve before freezing these field values
 *   a) MediaStoreRow.impressions/clicks: real only for ~25 SEG stores; rest synthetic.
 *      Needs SEG per-week reporting + creative→campaign join (API/Greenberg).
 *   b) Demographics per-store: source is panel-level only; per-store is synthesized.
 *      Needs a real per-store source OR drop the by-Store demographics tab (PM + Greenberg).
 *   c) Campaign taxonomy (4 audience-funnel buckets): not in Pulse; UI-only grouping until
 *      PM decides (add column / classify Group / drop).
 * Shapes above are stable; only the tagged VALUES are provisional.
 * ========================================================================== */
