import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}

export function StatCard({ title, value, color, icon }: StatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
});