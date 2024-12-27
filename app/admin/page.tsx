"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  Bell, 
  TrendingUp,
  Download,
  UserPlus,
  Eye
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500">{stat.increase}</span>
                  <span className="text-gray-600 ml-1">vs last month</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className={`${activity.color} p-2 rounded-lg`}>
                  {activity.icon}
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`${action.color} p-3 rounded-lg w-fit mb-4`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const stats = [
  {
    title: "Total Users",
    value: "1,234",
    increase: "+12.3%",
    color: "bg-blue-100 text-blue-600",
    icon: <Users className="w-6 h-6" />
  },
  {
    title: "Papers Uploaded",
    value: "856",
    increase: "+8.2%",
    color: "bg-purple-100 text-purple-600",
    icon: <FileText className="w-6 h-6" />
  },
  {
    title: "Active Notices",
    value: "23",
    increase: "+15.1%",
    color: "bg-yellow-100 text-yellow-600",
    icon: <Bell className="w-6 h-6" />
  },
  {
    title: "Paper Downloads",
    value: "12.5k",
    increase: "+18.7%",
    color: "bg-green-100 text-green-600",
    icon: <Download className="w-6 h-6" />
  }
];

const recentActivity = [
  {
    title: "New user registered",
    time: "2 minutes ago",
    color: "bg-blue-100 text-blue-600",
    icon: <UserPlus className="w-5 h-5" />
  },
  {
    title: "New paper uploaded - Computer Networks",
    time: "1 hour ago",
    color: "bg-purple-100 text-purple-600",
    icon: <FileText className="w-5 h-5" />
  },
  {
    title: "Notice published - Exam Schedule",
    time: "3 hours ago",
    color: "bg-yellow-100 text-yellow-600",
    icon: <Bell className="w-5 h-5" />
  }
];

const quickActions = [
  {
    title: "Upload Papers",
    description: "Add new question papers to the system",
    color: "bg-blue-100 text-blue-600",
    icon: <FileText className="w-6 h-6" />
  },
  {
    title: "Manage Users",
    description: "View and manage user accounts",
    color: "bg-purple-100 text-purple-600",
    icon: <Users className="w-6 h-6" />
  },
  {
    title: "View Analytics",
    description: "Check system statistics and usage",
    color: "bg-green-100 text-green-600",
    icon: <Eye className="w-6 h-6" />
  }
]; 