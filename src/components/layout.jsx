import Sidebar from "./sidebar";
import Header from "./header";

function Layout({
  children,
  activePage,
  setActivePage,
  students = [],
  currentUser = null,
  attendanceRecords = [],
  onLogout,
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* SIDEBAR */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* MAIN AREA */}
      <div className="ml-[270px] flex min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <Header
          students={students}
          currentUser={currentUser}
          attendanceRecords={attendanceRecords}
        />

        {/* PAGE CONTENT */}
        <main className="w-full flex-1 p-4 md:p-6 lg:p-8">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;