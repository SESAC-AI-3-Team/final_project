const api_key = "lin_api_2Nj0ANkDMe904DVioz8AH241500JImV5wsPYNDIm";
const query = `
mutation CreateIssue {
  issueCreate(input: {
    title: "Project Progress Sync: Mobile UI & Schedule Optimization",
    description: "Implemented the following features:\\n- Mobile bottom navigation applied to all main pages.\\n- AI Chat Modal UI refined for responsiveness with improved FAB positioning.\\n- Mobile Schedule page optimized with Agenda view and interactive dots.\\n- Schedule event navigation changed from modal to full-page Detail view.\\n- Main page layout refined for better alignment and typography.",
    teamId: "YOUR_TEAM_ID"
  }) {
    success
    issue {
      id
      title
      url
    }
  }
}
`;

// This is a placeholder. I first need to get the Team ID.
const getTeamsQuery = `
{
  teams {
    nodes {
      id
      name
      key
    }
  }
}
`;

async function syncToLinear() {
    try {
        const response = await fetch("https://api.linear.app/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": api_key
            },
            body: JSON.stringify({ query: getTeamsQuery })
        });
        const result = await response.json();
        console.log("Teams Found:", JSON.stringify(result.data.teams.nodes, null, 2));
    } catch (error) {
        console.error("Error syncing to Linear:", error);
    }
}

syncToLinear();
