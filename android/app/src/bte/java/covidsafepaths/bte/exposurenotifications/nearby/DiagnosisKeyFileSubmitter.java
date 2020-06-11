/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package covidsafepaths.bte.exposurenotifications.nearby;

import android.content.Context;
import android.util.Log;

import com.google.android.gms.nearby.Nearby;
import com.google.android.gms.nearby.exposurenotification.ExposureConfiguration;
import com.google.android.gms.nearby.exposurenotification.ExposureNotificationClient;
import com.google.common.io.BaseEncoding;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;

import org.threeten.bp.Duration;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import covidsafepaths.bte.exposurenotifications.common.AppExecutors;
import covidsafepaths.bte.exposurenotifications.common.TaskToFutureAdapter;
import covidsafepaths.bte.exposurenotifications.network.KeyFileBatch;

/**
 * A thin class to take responsibility for submitting downloaded Diagnosis Key files to the Google
 * Play Services Exposure Notifications API.
 */
public class DiagnosisKeyFileSubmitter {
    private static final String TAG = "KeyFileSubmitter";
    private static final Duration API_TIMEOUT = Duration.ofSeconds(10);
    private static final BaseEncoding BASE16 = BaseEncoding.base16().lowerCase();
    private static final BaseEncoding BASE64 = BaseEncoding.base64();

    private final ExposureNotificationClient client;

    public DiagnosisKeyFileSubmitter(Context context) {
        client = Nearby.getExposureNotificationClient(context);
    }

    /**
     * Accepts batches of key files, and submits them to provideDiagnosisKeys(), and returns a future
     * representing the completion of that task.
     *
     * <p>This naive implementation is not robust to individual failures. In fact, a single failure
     * will fail the entire operation. A more robust implementation would support retries, partial
     * completion, and other robustness measures.
     *
     * <p>Returns early if given an empty list of batches.
     */
    public ListenableFuture<?> submitFiles(List<KeyFileBatch> batches, ExposureConfiguration config, String token) {
        if (batches.isEmpty()) {
            Log.d(TAG, "No files to provide to google play services.");
            return Futures.immediateFuture(null);
        }
        Log.d(TAG, "Providing  " + batches.size() + " diagnosis key batches to google play services.");
        List<ListenableFuture<?>> batchCompletions = new ArrayList<>();
        for (KeyFileBatch b : batches) {
            batchCompletions.add(submitBatch(b, config, token));
        }

        ListenableFuture<?> allDone = Futures.allAsList(batchCompletions);
        allDone.addListener(
                () -> {
                    for (KeyFileBatch b : batches) {
                        for (File f : b.files()) {
                            f.delete();
                        }
                    }
                },
                AppExecutors.getBackgroundExecutor());

        return allDone;
    }

    private ListenableFuture<?> submitBatch(KeyFileBatch batch, ExposureConfiguration config, String token) {
        return TaskToFutureAdapter.getFutureWithTimeout(
                client.provideDiagnosisKeys(batch.files(), config, token),
                API_TIMEOUT.toMillis(),
                TimeUnit.MILLISECONDS,
                AppExecutors.getScheduledExecutor());
    }
}
