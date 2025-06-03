
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  data: any;
}

export const ExportButton = ({ data }: ExportButtonProps) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    if (!data?.portfolioData) return;

    const headers = ['Date', 'Portfolio Value', 'Benchmark Value', 'Total Invested'];
    const csvContent = [
      headers.join(','),
      ...data.portfolioData.map((row: any) => [
        new Date(row.date).toLocaleDateString(),
        row.portfolioValue.toFixed(2),
        row.benchmarkValue.toFixed(2),
        row.totalInvested.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `portfolio-simulation-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Export Complete",
      description: "Your simulation data has been exported to CSV"
    });
  };

  return (
    <Button onClick={exportToCSV} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
};
