import { useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineLink,
  AiOutlineLoading3Quarters,
  AiOutlinePlayCircle,
} from "react-icons/ai";
import { incrementViewCount, updateTutorialProgress } from "../../api/tutorials";
import { useScrollLock } from "../../hooks/useScrollLock";

const TutorialContentModal = ({ tutorial, onClose, onProgressSaved }) => {
  useScrollLock(true);
  const tutorialId = tutorial?._id || tutorial?.id;
  const [completedSteps, setCompletedSteps] = useState(
    tutorial?.progress?.completedSteps || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);

  const steps = tutorial?.steps || [];
  const isStructuredTutorial = tutorial?.type === "mission" || steps.length > 0;
  const progressPercent = useMemo(() => {
    if (!steps.length) {
      return tutorial?.progress?.status === "completed" ? 100 : 0;
    }

    return Math.round((completedSteps.length / steps.length) * 100);
  }, [completedSteps.length, steps.length, tutorial?.progress?.status]);

  const externalUrl = tutorial?.url || "";

  const saveProgress = async (nextCompletedSteps, status) => {
    if (!tutorialId) return;

    setIsSaving(true);
    try {
      const response = await updateTutorialProgress(tutorialId, {
        completedSteps: nextCompletedSteps,
        status,
      });
      onProgressSaved?.(tutorialId, response.data);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStep = async (stepIndex) => {
    const isCompleted = completedSteps.includes(stepIndex);
    const nextCompletedSteps = isCompleted
      ? completedSteps.filter((index) => index !== stepIndex)
      : [...completedSteps, stepIndex].sort((left, right) => left - right);

    setCompletedSteps(nextCompletedSteps);
    await saveProgress(nextCompletedSteps);
  };

  const markComplete = async () => {
    const allSteps = steps.map((_, index) => index);
    setCompletedSteps(allSteps);
    await saveProgress(allSteps, "completed");
  };

  const handleOpenResource = async () => {
    if (!viewCounted && tutorialId) {
      await incrementViewCount(tutorialId);
      setViewCounted(true);
    }

    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/d\/([^/]+)/);
      return match?.[1] ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
    }
    return url;
  };

  const videoUrl = tutorial?.type === "video" ? getVideoEmbedUrl(externalUrl) : "";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700/70"
        >
          <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/70 p-4 md:p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-md bg-cyan-500/15 text-cyan-300 text-xs font-semibold uppercase tracking-wide">
                  {tutorial.platform || tutorial.category}
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-700/70 text-slate-300 text-xs capitalize">
                  {tutorial.type || "tutorial"}
                </span>
                {tutorial.coreSkill && (
                  <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-xs">
                    {tutorial.coreSkill}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">{tutorial.title}</h2>
              <p className="text-sm text-slate-300 mt-2 max-w-3xl">{tutorial.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors"
              aria-label="Close tutorial"
            >
              <AiOutlineClose className="w-6 h-6 text-slate-300" />
            </button>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Progress</span>
                <span className="text-sm text-slate-300">{progressPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {tutorial.outcome && (
              <section className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Outcome</h3>
                <p className="text-slate-300 text-sm">{tutorial.outcome}</p>
              </section>
            )}

            {isStructuredTutorial ? (
              <section className="space-y-3">
                {steps.map((step, index) => {
                  const isCompleted = completedSteps.includes(index);

                  return (
                    <div
                      key={`${step.title}-${index}`}
                      className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleStep(index)}
                          disabled={isSaving}
                          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-400 text-white"
                              : "border-slate-500 text-slate-400 hover:border-emerald-400"
                          }`}
                          aria-label={isCompleted ? "Mark step incomplete" : "Mark step complete"}
                        >
                          {isCompleted && <AiOutlineCheck className="w-4 h-4" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-semibold">
                            Step {index + 1}: {step.title}
                          </h3>
                          <p className="text-slate-300 text-sm mt-1">{step.body}</p>
                          {step.code && (
                            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950/80 p-3 text-sm text-cyan-100">
                              <code>{step.code}</code>
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            ) : tutorial?.type === "video" && videoUrl ? (
              <section className="overflow-hidden rounded-xl bg-slate-950 border border-slate-700/60">
                <div className="relative pt-[56.25%]">
                  {videoUrl.includes("drive.google.com") ? (
                    <iframe
                      src={videoUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="autoplay"
                      allowFullScreen
                      onLoad={() => {
                        if (!viewCounted && tutorialId) {
                          incrementViewCount(tutorialId);
                          setViewCounted(true);
                        }
                      }}
                    />
                  ) : (
                    <video
                      className="absolute inset-0 w-full h-full"
                      controls
                      poster={tutorial.thumbnail}
                      onPlay={() => {
                        if (!viewCounted && tutorialId) {
                          incrementViewCount(tutorialId);
                          setViewCounted(true);
                        }
                      }}
                    >
                      <source src={videoUrl} type="video/mp4" />
                    </video>
                  )}
                </div>
              </section>
            ) : (
              <section className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 text-center">
                <AiOutlineLink className="w-10 h-10 text-cyan-300 mx-auto mb-3" />
                <p className="text-slate-300 text-sm mb-4">
                  This tutorial opens as an external resource.
                </p>
                <button
                  onClick={handleOpenResource}
                  disabled={!externalUrl}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold disabled:opacity-50"
                >
                  <AiOutlinePlayCircle className="w-5 h-5" />
                  Open Tutorial
                </button>
              </section>
            )}

            {(tutorial.successChecks?.length > 0 || tutorial.learned?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorial.successChecks?.length > 0 && (
                  <section className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">Success Check</h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {tutorial.successChecks.map((item) => (
                        <li key={item} className="flex gap-2">
                          <AiOutlineCheck className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {tutorial.learned?.length > 0 && (
                  <section className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-slate-200 mb-3">What You Learned</h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {tutorial.learned.map((item) => (
                        <li key={item} className="flex gap-2">
                          <AiOutlineCheck className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}

            {tutorial.sourceText && (
              <section className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">
                  Handbook Mission Text
                </h3>
                <div className="max-h-72 overflow-y-auto rounded-lg bg-slate-950/70 p-3 text-sm leading-6 text-slate-300 whitespace-pre-wrap">
                  {tutorial.sourceText}
                </div>
              </section>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
              <div className="text-sm text-slate-400 flex items-center gap-2">
                {isSaving && <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />}
                {isSaving ? "Saving progress..." : "Progress saves to your account."}
              </div>
              {isStructuredTutorial && (
                <button
                  onClick={markComplete}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold disabled:opacity-60"
                >
                  Mark Tutorial Complete
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TutorialContentModal;
