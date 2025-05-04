import { Loader2 } from 'lucide-react';

const LoadingWrapper = ({ loading, children }: { loading: boolean; children: React.ReactNode }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full p-6">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
      </div>
    );
  }
  return <>{children}</>;
};
export default LoadingWrapper;