interface Props {
  message?: string;
}

const FamilyErrorState = ({ message }: Props) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        {message || "Unable to load family tree."}
      </div>
    </div>
  );
};

export default FamilyErrorState;