"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  GitBranch,
  Layers3,
  LockKeyhole,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { LanguageIcon } from "@/components/icons/language-icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useCurrentUser } from "@/hooks/use-auth";
import { ApiError, api, type IndexStatus } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

function statusStyles(status: IndexStatus) {
  switch (status) {
    case "READY":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "INDEXING":
      return "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "FAILED":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get the currently authenticated user.
  const userQuery = useCurrentUser();
  const user = userQuery.data;

  // Redirect to login if the backend says the session is unauthorized.
  useEffect(() => {
    if (
      userQuery.error instanceof ApiError &&
      userQuery.error.status === 401
    ) {
      router.replace("/login?next=%2Fdashboard");
    }
  }, [userQuery.error, router]);

  // Load repositories from the existing Spring Boot API.
  const reposQuery = useQuery({
    queryKey: queryKeys.repos.list(),
    queryFn: () => api.listRepos(),
    staleTime: 30_000,
  });

  // Ask the backend to index a repository.
  const indexMutation = useMutation({
    mutationFn: (repositoryId: string) => api.startIndex(repositoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.repos.all,
      });
    },
  });

  const repositories = reposQuery.data ?? [];

  // These figures come from API data, not hardcoded numbers.
  const readyCount = repositories.filter(
    (repo) => repo.indexStatus === "READY",
  ).length;

  const indexingCount = repositories.filter(
    (repo) => repo.indexStatus === "INDEXING",
  ).length;

  const totalChunks = repositories.reduce(
    (total, repo) => total + repo.chunkCount,
    0,
  );

  const firstName =
    user?.displayName?.trim().split(/\s+/)[0] ||
    user?.githubUsername ||
    "there";

  const metrics = [
    {
      label: "Repositories",
      value: repositories.length,
      description: "Available in your workspace",
      icon: GitBranch,
    },
    {
      label: "Ready to chat",
      value: readyCount,
      description: "Successfully indexed",
      icon: CheckCircle2,
    },
    {
      label: "In progress",
      value: indexingCount,
      description: "Currently indexing",
      icon: Clock3,
    },
    {
      label: "Code chunks",
      value: totalChunks.toLocaleString(),
      description: "Indexed code segments",
      icon: Layers3,
    },
  ];

  return (
    <AppShell
      title="Workspace"
      description="Your repositories, in one place"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => void reposQuery.refetch()}
          disabled={reposQuery.isFetching}
        >
          <RefreshCw
            className={`mr-2 size-4 ${
              reposQuery.isFetching ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      }
    >
      <main className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Welcome section */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="size-4" />
              Your workspace
            </div>

            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {firstName}.
            </h2>

            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Your code, organized and ready to explore. Choose a repository
              to check its indexing status and prepare it for code-aware chat.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            GitHub workspace
          </div>
        </section>

        {/* Summary cards */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const MetricIcon = metric.icon;

            return (
              <Card
                key={metric.label}
                className="border-border/70 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="flex items-start justify-between p-5">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-3xl font-semibold tracking-tight tabular-nums">
                      {metric.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-muted/50 p-2.5">
                    <MetricIcon className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Indexing errors */}
        {indexMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Could not start indexing</AlertTitle>
            <AlertDescription>
              {indexMutation.error instanceof Error
                ? indexMutation.error.message
                : "Something went wrong. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Repository list */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">
                Your repositories
              </h2>
              <p className="text-sm text-muted-foreground">
                Browse your projects and manage code indexing.
              </p>
            </div>

            <span className="rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              {repositories.length} total
            </span>
          </div>

          {/* Loading state */}
          {reposQuery.isLoading && (
            <div className="grid gap-4 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="border-border/70">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex gap-3">
                      <div className="size-10 animate-pulse rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-full animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error state */}
          {reposQuery.isError && (
            <Card className="border-destructive/20">
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <AlertCircle className="size-8 text-destructive" />

                <h3 className="font-medium">
                  Could not load repositories
                </h3>

                <p className="max-w-md text-sm text-muted-foreground">
                  {reposQuery.error instanceof ApiError
                    ? reposQuery.error.message
                    : "Check that your backend is running and the repository API is available."}
                </p>

                <Button
                  variant="outline"
                  onClick={() => void reposQuery.refetch()}
                >
                  Try again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {reposQuery.isSuccess && repositories.length === 0 && (
            <Card className="border-dashed border-border/80 shadow-none">
              <CardContent className="flex flex-col items-center px-6 py-14 text-center">
                <div className="mb-4 rounded-2xl border bg-muted/40 p-4">
                  <GitBranch className="size-7 text-muted-foreground" />
                </div>

                <h3 className="font-semibold">No repositories yet</h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  No repositories were returned by the backend. Refresh to
                  check again.
                </p>

                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => void reposQuery.refetch()}
                >
                  <RefreshCw className="mr-2 size-4" />
                  Refresh repositories
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Repository cards */}
          {reposQuery.isSuccess && repositories.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {repositories.map((repo) => (
                <Card
                  key={repo.id}
                  className="group border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <LanguageIcon
                        language={repo.language}
                        size="lg"
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="break-all text-base font-semibold tracking-tight">
                            {repo.fullName}
                          </CardTitle>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyles(
                              repo.indexStatus,
                            )}`}
                          >
                            {repo.indexStatus.toLowerCase()}
                          </span>
                        </div>

                        <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                          {repo.description || "No description provided."}
                        </p>
                      </div>

                      {repo.htmlUrl && (
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${repo.fullName} on GitHub`}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ArrowUpRight className="size-4" />
                        </a>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      {repo.isPrivate && (
                        <span className="flex items-center gap-1.5">
                          <LockKeyhole className="size-3.5" />
                          Private
                        </span>
                      )}

                      <span className="flex items-center gap-1.5">
                        <GitBranch className="size-3.5" />
                        {repo.defaultBranch || "No default branch"}
                      </span>

                      <span>
                        {repo.filesProcessed.toLocaleString()} /{" "}
                        {repo.filesTotal.toLocaleString()} files
                      </span>

                      <span>
                        {repo.chunkCount.toLocaleString()} chunks
                      </span>
                    </div>

                    {repo.errorMessage && (
                      <p className="rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">
                        {repo.errorMessage}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t pt-4">
                      <div className="min-w-0">
                        {repo.indexStatus === "READY" ? (
                          <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="size-3.5" />
                            Ready to chat
                          </p>
                        ) : repo.indexStatus === "INDEXING" ? (
                          <p className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400">
                            <RefreshCw className="size-3.5 animate-spin" />
                            Indexing in progress
                          </p>
                        ) : (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Layers3 className="size-3.5" />
                            {repo.indexStatus === "FAILED"
                              ? "Indexing needs attention"
                              : "Not indexed yet"}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          repo.indexStatus === "INDEXING" ||
                          indexMutation.isPending
                        }
                        onClick={() => indexMutation.mutate(repo.id)}
                      >
                        <Sparkles className="mr-2 size-3.5" />

                        {repo.indexStatus === "READY"
                          ? "Re-index"
                          : repo.indexStatus === "INDEXING"
                            ? "Indexing…"
                            : "Index repository"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}