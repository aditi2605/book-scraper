import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Package, Star, DollarSign } from 'lucide-react';
import type { BookAnalytics } from '../types';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

export function AnalyticsDashboard({ analytics }: { analytics: BookAnalytics | null }) {
  if (!analytics || analytics.totalBooks === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-400">No data yet. Scrape some books first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Package size={20} />, label: 'Total Books', value: String(analytics.totalBooks), color: 'bg-blue-50 text-blue-600' },
          { icon: <DollarSign size={20} />, label: 'Avg Price', value: `£${analytics.averagePrice}`, color: 'bg-green-50 text-green-600' },
          { icon: <Star size={20} />, label: 'Avg Rating', value: `${analytics.averageRating}/5`, color: 'bg-amber-50 text-amber-600' },
          { icon: <TrendingUp size={20} />, label: 'In Stock', value: `${analytics.inStockCount}/${analytics.totalBooks}`, color: 'bg-purple-50 text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Price Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Price Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.ratingDistribution}
                dataKey="count"
                nameKey="rating"
                cx="50%" cy="50%"
                outerRadius={80}
                label={({ rating, count }) => `${rating}★ (${count})`}
              >
                {analytics.ratingDistribution.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [value, `${name} Stars`]} />
              <Legend formatter={(value) => `${value} Stars`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}