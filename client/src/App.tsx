import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import { AuthenticateWithRedirectCallback, CreateOrganization } from "@clerk/clerk-react";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sign-in' element={<SignInPage />} />
        <Route path='/sign-up' element={<SignUpPage />} />
        <Route path="/sign-in/sso-callback" element={
          <AuthenticateWithRedirectCallback
            signInForceRedirectUrl='/dashboard'
            signInFallbackRedirectUrl="/dashboard"
          />}
        />
        <Route path="/sign-up/sso-callback" element={
          <AuthenticateWithRedirectCallback
            signUpForceRedirectUrl='/dashboard'
            signUpFallbackRedirectUrl='/dashboard'
          />}
        />
        <Route
          path="/create-organization"
          element={
            <div className="min-h-screen flex justify-center items-center">
              <CreateOrganization
                routing="path"
                path="/create-organization"
                afterCreateOrganizationUrl="/dashboard"
              />
            </div>
          }
        />
        <Route element={<Layout />}>
          <Route path='dashboard' element={<Dashboard />} />
          <Route path="team" element={<Team />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projectsDetail" element={<ProjectDetails />} />
          <Route path="taskDetails" element={<TaskDetails />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
