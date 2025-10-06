
export const DivideX = () => {
  return (
    <div className="border-divide relative h-px w-full border-t">
      <div className="absolute inset-x-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-divide to-transparent" />
    </div>
  );
};

export const DivideY = () => {
  return (
    <div className="border-divide relative h-full w-px border-l">
      <div className="absolute inset-y-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-divide to-transparent" />
    </div>
  );
};
