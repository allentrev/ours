import React from 'react';

interface MaintainPageLayoutProps {
  backgroundImage: string;
  title?: string;
  editMode: boolean;
  filter?: React.ReactNode;
  commands: React.ReactNode;
  listPanel: React.ReactNode;
  editPanel?: React.ReactNode;
}

const MaintainPageLayout: React.FC<MaintainPageLayoutProps> = ({
  backgroundImage,
  title,
  editMode,
  filter,
  commands,
  listPanel,
  editPanel,
}) => {
  return (
    <div
      className="min-h-screen bg-gray-100 font-inter text-gray-800 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="min-h-screen bg-opacity-50 backdrop-blur-sm p-4">
        <header className="w-full text-gray-700  rounded-b-lg mb-4">
          <h1 className="text-4xl font-extrabold text-center drop-shadow-lg">{ title }</h1>
        </header>

        <div className="p-4 max-w-7xl mx-auto rounded-xl bg-gray-300 bg-opacity-90 shadow-2xl space-y-4">
          {/* Filter (only if provided) */}
          {filter && <div>{filter}</div>}
          {/* Main content: list/edit + commands */}
          <div className="flex flex-col md:flex-row gap-6">
            
            <div className="flex-1">
              {editMode ? editPanel : listPanel}
            </div>
            <div className="w-full md:w-1/3">
              {commands}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintainPageLayout;
