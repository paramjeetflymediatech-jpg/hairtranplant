package com.example.asghair.ui.main

import android.content.Context
import android.net.Uri
import android.util.Base64
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation3.runtime.NavKey
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.ByteArrayOutputStream
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

// Custom Palette matching GraftDesk & ASG Web
val BrandTeal = Color(0xFF0D9488)
val BrandDark = Color(0xFF0F172A)
val BrandSlate = Color(0xFF475569)
val BrandLightBg = Color(0xFFF8FAFC)
val BrandEmerald = Color(0xFF059669)
val BrandRose = Color(0xFFE11D48)

@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier,
) {
  val context = LocalContext.current
  val scrollState = rememberScrollState()

  // Form Fields State
  var name by remember { mutableStateOf("") }
  var email by remember { mutableStateOf("") }
  var phone by remember { mutableStateOf("") }

  // Base64 photos mapping
  var frontPhotoBase64 by remember { mutableStateOf("") }
  var topPhotoBase64 by remember { mutableStateOf("") }
  var leftPhotoBase64 by remember { mutableStateOf("") }
  var rightPhotoBase64 by remember { mutableStateOf("") }
  var backPhotoBase64 by remember { mutableStateOf("") }

  // Selection Indicators
  var frontSelected by remember { mutableStateOf(false) }
  var topSelected by remember { mutableStateOf(false) }
  var leftSelected by remember { mutableStateOf(false) }
  var rightSelected by remember { mutableStateOf(false) }
  var backSelected by remember { mutableStateOf(false) }

  // Network & UI States
  var isLoading by remember { mutableStateOf(false) }
  var progressText by remember { mutableStateOf("") }
  var errorMessage by remember { mutableStateOf<String?>(null) }

  // Result parsing state
  var reportNorwoodStage by remember { mutableStateOf<String?>(null) }
  var reportProcedure by remember { mutableStateOf<String?>(null) }
  var reportGraftsRange by remember { mutableStateOf<String?>(null) }
  var reportDonorQuality by remember { mutableStateOf<String?>(null) }
  var reportFindings by remember { mutableStateOf<List<String>>(emptyList()) }
  var isReportVisible by remember { mutableStateOf(false) }

  // Future look visualizer states
  var isFutureLookVisible by remember { mutableStateOf(false) }
  var futureLookBitmap by remember { mutableStateOf<Bitmap?>(null) }
  var isDownloadingFutureLook by remember { mutableStateOf(false) }

  // Image Pickers launchers
  val frontLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia(),
    onResult = { uri ->
      if (uri != null) {
        frontPhotoBase64 = encodeUriToBase64(context, uri)
        frontSelected = frontPhotoBase64.isNotEmpty()
      }
    }
  )

  val topLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia(),
    onResult = { uri ->
      if (uri != null) {
        topPhotoBase64 = encodeUriToBase64(context, uri)
        topSelected = topPhotoBase64.isNotEmpty()
      }
    }
  )

  val leftLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia(),
    onResult = { uri ->
      if (uri != null) {
        leftPhotoBase64 = encodeUriToBase64(context, uri)
        leftSelected = leftPhotoBase64.isNotEmpty()
      }
    }
  )

  val rightLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia(),
    onResult = { uri ->
      if (uri != null) {
        rightPhotoBase64 = encodeUriToBase64(context, uri)
        rightSelected = rightPhotoBase64.isNotEmpty()
      }
    }
  )

  val backLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia(),
    onResult = { uri ->
      if (uri != null) {
        backPhotoBase64 = encodeUriToBase64(context, uri)
        backSelected = backPhotoBase64.isNotEmpty()
      }
    }
  )

  fun triggerAnalysis() {
    if (name.isBlank() || email.isBlank()) {
      errorMessage = "Name and Email are required"
      return
    }
    val hasPhotos = frontSelected || topSelected || leftSelected || rightSelected || backSelected
    if (!hasPhotos) {
      errorMessage = "Please upload at least one scalp view photograph."
      return
    }

    isLoading = true
    errorMessage = null
    progressText = "Gemini AI is analyzing your scalp density..."

    val photosMap = mutableMapOf<String, String>()
    if (frontSelected) photosMap["frontPhoto"] = frontPhotoBase64
    if (topSelected) photosMap["topPhoto"] = topPhotoBase64
    if (leftSelected) photosMap["leftPhoto"] = leftPhotoBase64
    if (rightSelected) photosMap["rightPhoto"] = rightPhotoBase64
    if (backSelected) photosMap["backPhoto"] = backPhotoBase64

    runPublicAnalysis(name, email, phone, photosMap) { jsonString, errorStr ->
      isLoading = false
      if (errorStr != null) {
        errorMessage = errorStr
      } else if (jsonString != null) {
        try {
          val root = JSONObject(jsonString)
          val success = root.optBoolean("success", false)
          if (success) {
            val analysis = root.getJSONObject("analysis")
            reportNorwoodStage = analysis.optString("norwoodStage", "Norwood Stage N/A")
            
            // Get procedure recommendation safely
            val procObj = analysis.optJSONObject("procedureAssessment")
            reportProcedure = procObj?.optString("preliminaryRecommendation", "FUE") ?: "FUE"
            
            val graftObj = analysis.optJSONObject("estimatedGraftRequirement")
            if (graftObj != null) {
              val minG = graftObj.optInt("minimumGrafts", 1500)
              val maxG = graftObj.optInt("maximumGrafts", 2000)
              reportGraftsRange = "$minG - $maxG Follicular Units"
            } else {
              reportGraftsRange = "1,800 - 2,200 Grafts"
            }

            val donorObj = analysis.optJSONObject("donorArea")
            if (donorObj != null) {
              val rating = donorObj.optString("rating", "GOOD")
              val density = donorObj.optInt("densityEstimateGraftsPerCm2", 75)
              val score = donorObj.optInt("qualityScore", 80)
              reportDonorQuality = "$rating / $density grafts/cm² (Quality: $score/100)"
            } else {
              reportDonorQuality = "GOOD / 75 grafts/cm²"
            }

            val findingsArray = analysis.optJSONArray("clinicalObservations")
            val findingsList = mutableListOf<String>()
            if (findingsArray != null) {
              for (i in 0 until findingsArray.length()) {
                findingsList.add(findingsArray.getString(i))
              }
            }
            reportFindings = findingsList
            isReportVisible = true
          } else {
            errorMessage = "Analysis returned failure status."
          }
        } catch (e: Exception) {
          errorMessage = "Parsing Error: " + e.message
        }
      }
    }
  }

  // Load future look simulation bitmap from server when requested
  LaunchedEffect(isFutureLookVisible) {
    if (isFutureLookVisible && futureLookBitmap == null) {
      isDownloadingFutureLook = true
      Thread {
        try {
          // Check if Norwood stage is severe (stage 5/6/7)
          val isSevere = reportNorwoodStage?.contains("V") == true || reportNorwoodStage?.contains("VI") == true
          val imageUrl = if (isSevere) {
            "http://10.0.2.2:3000/images/showcase/after_severe.png"
          } else {
            "http://10.0.2.2:3000/images/showcase/after.png"
          }
          val url = URL(imageUrl)
          val conn = url.openConnection() as HttpURLConnection
          conn.doInput = true
          conn.connect()
          val input = conn.inputStream
          val bitmap = BitmapFactory.decodeStream(input)
          futureLookBitmap = bitmap
        } catch (e: Exception) {
          e.printStackTrace()
        } finally {
          isDownloadingFutureLook = false
        }
      }.start()
    }
  }

  fun resetFlow() {
    name = ""
    email = ""
    phone = ""
    frontPhotoBase64 = ""
    topPhotoBase64 = ""
    leftPhotoBase64 = ""
    rightPhotoBase64 = ""
    backPhotoBase64 = ""
    frontSelected = false
    topSelected = false
    leftSelected = false
    rightSelected = false
    backSelected = false
    isReportVisible = false
    isFutureLookVisible = false
    futureLookBitmap = null
    errorMessage = null
  }

  // Helper to decode user's first uploaded photo back to a Compose-friendly bitmap
  val uploadedPhotoBitmap = remember(isFutureLookVisible, frontPhotoBase64, topPhotoBase64, leftPhotoBase64, rightPhotoBase64, backPhotoBase64) {
    val base64 = when {
      frontPhotoBase64.isNotEmpty() -> frontPhotoBase64
      topPhotoBase64.isNotEmpty() -> topPhotoBase64
      leftPhotoBase64.isNotEmpty() -> leftPhotoBase64
      rightPhotoBase64.isNotEmpty() -> rightPhotoBase64
      else -> backPhotoBase64
    }
    if (base64.isNotEmpty()) {
      try {
        val bytes = Base64.decode(base64, Base64.NO_WRAP)
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
      } catch (e: Exception) {
        null
      }
    } else {
      null
    }
  }

  Column(
    modifier = modifier
      .fillMaxSize()
      .background(BrandLightBg)
      .verticalScroll(scrollState)
      .padding(horizontal = 20.dp, vertical = 24.dp),
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    // Branding Header
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(bottom = 24.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.Center
    ) {
      Text(
        text = "ASG",
        fontSize = 24.sp,
        fontWeight = FontWeight.Black,
        color = BrandTeal,
        modifier = Modifier.padding(end = 4.dp)
      )
      Text(
        text = "HAIR TRANSPLANT",
        fontSize = 20.sp,
        fontWeight = FontWeight.ExtraBold,
        color = BrandDark
      )
    }

    if (isFutureLookVisible) {
      // Comparison / Future Look Simulation Visualizer Screen
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(24.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(24.dp)
      ) {
        Column(
          modifier = Modifier.padding(24.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Text(
            text = "Hair Restoration Visualizer",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = BrandDark
          )
          Spacer(modifier = Modifier.height(6.dp))
          Text(
            text = "Simulated results based on FUE transplant restoration",
            fontSize = 11.sp,
            color = BrandSlate,
            textAlign = TextAlign.Center
          )

          Spacer(modifier = Modifier.height(24.dp))

          // Original Uploaded View
          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
              text = "YOUR CURRENT SCALP VIEW",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = BrandRose,
              modifier = Modifier.padding(bottom = 6.dp)
            )
            Box(
              modifier = Modifier
                .size(180.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(BrandLightBg)
                .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(16.dp)),
              contentAlignment = Alignment.Center
            ) {
              if (uploadedPhotoBitmap != null) {
                Image(
                  bitmap = uploadedPhotoBitmap.asImageBitmap(),
                  contentDescription = "Uploaded scalp view",
                  modifier = Modifier.fillMaxSize(),
                  contentScale = ContentScale.Crop
                )
              } else {
                Text("No photo found", fontSize = 11.sp, color = BrandSlate)
              }
            }
          }

          Spacer(modifier = Modifier.height(24.dp))

          // Simulated Full Hairy Look
          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
              text = "SIMULATED OUTCOME LOOK",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = BrandEmerald,
              modifier = Modifier.padding(bottom = 6.dp)
            )
            Box(
              modifier = Modifier
                .size(180.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(BrandLightBg)
                .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(16.dp)),
              contentAlignment = Alignment.Center
            ) {
              if (isDownloadingFutureLook) {
                CircularProgressIndicator(color = BrandTeal, modifier = Modifier.size(32.dp))
              } else if (futureLookBitmap != null) {
                Image(
                  bitmap = futureLookBitmap!!.asImageBitmap(),
                  contentDescription = "Simulated transplant look",
                  modifier = Modifier.fillMaxSize(),
                  contentScale = ContentScale.Crop
                )
              } else {
                Text("Failed to load visual. Verify local server.", fontSize = 11.sp, color = BrandRose, textAlign = TextAlign.Center, modifier = Modifier.padding(8.dp))
              }
            }
          }

          Spacer(modifier = Modifier.height(24.dp))

          Text(
            text = "The restored look shows typical follicle density outcomes. Final results depend on donor density and surgeon design.",
            fontSize = 10.sp,
            color = BrandSlate,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 8.dp)
          )

          Spacer(modifier = Modifier.height(24.dp))

          Button(
            onClick = { isFutureLookVisible = false },
            modifier = Modifier
              .fillMaxWidth()
              .height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = BrandDark),
            shape = RoundedCornerShape(16.dp)
          ) {
            Text("Back to Assessment Report", color = Color.White, fontWeight = FontWeight.Bold)
          }
        }
      }
    } else if (isReportVisible) {
      // Diagnostic Results Panel
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(24.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(24.dp)
      ) {
        Column(
          modifier = Modifier.padding(24.dp),
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          Box(
            modifier = Modifier
              .background(BrandTeal.copy(alpha = 0.1f), RoundedCornerShape(12.dp))
              .padding(horizontal = 12.dp, vertical = 6.dp)
          ) {
            Text(
              text = "DIAGNOSTICS COMPLETE",
              color = BrandTeal,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold
            )
          }

          Spacer(modifier = Modifier.height(16.dp))

          Text(
            text = "Your Scalp Assessment",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = BrandDark
          )

          Spacer(modifier = Modifier.height(20.dp))

          // Parameters Grid
          AssessmentParameterRow(title = "Norwood Loss Stage", value = reportNorwoodStage ?: "Stage N/A")
          Divider()
          AssessmentParameterRow(title = "Suggested Procedure", value = reportProcedure ?: "FUE")
          Divider()
          AssessmentParameterRow(title = "Estimated Graft Count", value = reportGraftsRange ?: "Calculating...")
          Divider()
          AssessmentParameterRow(title = "Donor Density & Quality", value = reportDonorQuality ?: "Good")

          Spacer(modifier = Modifier.height(20.dp))

          // Clinical Observations
          if (reportFindings.isNotEmpty()) {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .background(BrandLightBg, RoundedCornerShape(16.dp))
                .padding(16.dp)
            ) {
              Text(
                text = "Key Clinical Observations:",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = BrandDark,
                modifier = Modifier.padding(bottom = 8.dp)
              )
              reportFindings.forEach { finding ->
                Text(
                  text = "• $finding",
                  fontSize = 12.sp,
                  color = BrandSlate,
                  modifier = Modifier.padding(vertical = 2.dp)
                )
              }
            }
          }

          Spacer(modifier = Modifier.height(20.dp))

          // Conditionally Render Future Look Visualizer Button (if transplant FUE/DHI/FUT is recommended)
          val isTransplantRecommended = reportProcedure?.contains("FUE") == true || 
                                       reportProcedure?.contains("DHI") == true || 
                                       reportProcedure?.contains("FUT") == true || 
                                       reportProcedure?.contains("Transplant") == true
          
          if (isTransplantRecommended) {
            Button(
              onClick = { isFutureLookVisible = true },
              modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
              colors = ButtonDefaults.buttonColors(containerColor = BrandEmerald),
              shape = RoundedCornerShape(16.dp)
            ) {
              Text("See Your Future Hairy Look", color = Color.White, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(12.dp))
          }

          Text(
            text = "A consultation lead has been registered at our Jalandhar clinic. Our clinical experts will reach out to you shortly.",
            fontSize = 11.sp,
            color = BrandSlate,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 8.dp)
          )

          Spacer(modifier = Modifier.height(20.dp))

          Button(
            onClick = { resetFlow() },
            modifier = Modifier
              .fillMaxWidth()
              .height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = BrandDark),
            shape = RoundedCornerShape(16.dp)
          ) {
            Text("Run New Assessment", color = Color.White, fontWeight = FontWeight.Bold)
          }
        }
      }
    } else if (isLoading) {
      // Diagnostic Processing Loader
      Spacer(modifier = Modifier.height(48.dp))
      CircularProgressIndicator(color = BrandTeal, strokeWidth = 4.dp)
      Spacer(modifier = Modifier.height(24.dp))
      Text(
        text = "Processing Your Request",
        fontSize = 18.sp,
        fontWeight = FontWeight.Bold,
        color = BrandDark
      )
      Spacer(modifier = Modifier.height(8.dp))
      Text(
        text = progressText,
        fontSize = 13.sp,
        color = BrandSlate,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(horizontal = 24.dp)
      )
      Spacer(modifier = Modifier.height(48.dp))
    } else {
      // Registration & Upload Form
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(24.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(24.dp)
      ) {
        Column(
          modifier = Modifier.padding(24.dp),
          verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
          Text(
            text = "AI Hair Assessment Form",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = BrandDark
          )

          OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Full Name") },
            placeholder = { Text("Enter your name") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
          )

          OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email Address") },
            placeholder = { Text("Enter your email") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
          )

          OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Phone Number (Optional)") },
            placeholder = { Text("Enter contact number") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
          )

          Spacer(modifier = Modifier.height(8.dp))

          Text(
            text = "Upload Scalp Photographs (At least 1 required)",
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = BrandSlate
          )

          // Grid Photo Selectors
          Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            PhotoUploadRow(title = "Front Hairline View", isSelected = frontSelected) {
              frontLauncher.launch(androidx.activity.result.PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
            }
            PhotoUploadRow(title = "Top / Crown View", isSelected = topSelected) {
              topLauncher.launch(androidx.activity.result.PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
            }
            PhotoUploadRow(title = "Left Profile View", isSelected = leftSelected) {
              leftLauncher.launch(androidx.activity.result.PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
            }
            PhotoUploadRow(title = "Right Profile View", isSelected = rightSelected) {
              rightLauncher.launch(androidx.activity.result.PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
            }
            PhotoUploadRow(title = "Back / Donor View", isSelected = backSelected) {
              backLauncher.launch(androidx.activity.result.PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
            }
          }

          errorMessage?.let { error ->
            Text(
              text = error,
              color = BrandRose,
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold,
              modifier = Modifier.padding(vertical = 4.dp)
            )
          }

          Button(
            onClick = { triggerAnalysis() },
            modifier = Modifier
              .fillMaxWidth()
              .height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = BrandTeal),
            shape = RoundedCornerShape(16.dp)
          ) {
            Text("Analyze My Hair", color = Color.White, fontWeight = FontWeight.Bold)
          }
        }
      }
    }
  }
}

@Composable
fun PhotoUploadRow(title: String, isSelected: Boolean, onClick: () -> Unit) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(16.dp))
      .background(if (isSelected) BrandEmerald.copy(alpha = 0.08f) else BrandLightBg)
      .border(
        width = 1.dp,
        color = if (isSelected) BrandEmerald.copy(alpha = 0.4f) else Color(0xFFE2E8F0),
        shape = RoundedCornerShape(16.dp)
      )
      .clickable { onClick() }
      .padding(horizontal = 16.dp, vertical = 12.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.SpaceBetween
  ) {
    Text(
      text = title,
      fontSize = 12.sp,
      fontWeight = FontWeight.SemiBold,
      color = BrandDark
    )
    Text(
      text = if (isSelected) "Selected ✓" else "Choose File",
      fontSize = 11.sp,
      fontWeight = FontWeight.Bold,
      color = if (isSelected) BrandEmerald else BrandTeal
    )
  }
}

@Composable
fun AssessmentParameterRow(title: String, value: String) {
  Row(
    modifier = Modifier
      .fillMaxWidth()
      .padding(vertical = 12.dp),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
  ) {
    Text(
      text = title,
      fontSize = 12.sp,
      color = BrandSlate,
      fontWeight = FontWeight.Medium
    )
    Text(
      text = value,
      fontSize = 13.sp,
      color = BrandDark,
      fontWeight = FontWeight.Bold
    )
  }
}

@Composable
fun Divider() {
  Box(
    modifier = Modifier
      .fillMaxWidth()
      .height(1.dp)
      .background(Color(0xFFF1F5F9))
  )
}

// Utility: Base64 encoder with compression
fun encodeUriToBase64(context: Context, uri: Uri): String {
  return try {
    val inputStream = context.contentResolver.openInputStream(uri)
    val bitmap = BitmapFactory.decodeStream(inputStream)
    inputStream?.close()

    if (bitmap == null) return ""

    // Compress to Jpeg to limit data payload size
    val outputStream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, 65, outputStream)
    val bytes = outputStream.toByteArray()
    Base64.encodeToString(bytes, Base64.NO_WRAP)
  } catch (e: Exception) {
    e.printStackTrace()
    ""
  }
}

// Network worker
fun runPublicAnalysis(
  name: String,
  email: String,
  phone: String,
  photos: Map<String, String>,
  onResult: (String?, String?) -> Unit
) {
  Thread {
    try {
      // Connect to the Next.js API running locally (using emulator's loopback mapping to localhost)
      val url = URL("http://10.0.2.2:3000/api/public/ai-analysis")
      val conn = url.openConnection() as HttpURLConnection
      conn.requestMethod = "POST"
      conn.setRequestProperty("Content-Type", "application/json; charset=utf-8")
      conn.doOutput = true
      conn.doInput = true

      val requestJson = JSONObject()
      requestJson.put("name", name)
      requestJson.put("email", email)
      requestJson.put("phone", phone)

      val photosJson = JSONObject()
      photos.forEach { (key, value) ->
        photosJson.put(key, value)
      }
      requestJson.put("photos", photosJson)

      val wr = OutputStreamWriter(conn.outputStream)
      wr.write(requestJson.toString())
      wr.flush()
      wr.close()

      val responseCode = conn.responseCode
      if (responseCode == 200) {
        val reader = BufferedReader(InputStreamReader(conn.inputStream))
        val sb = java.lang.StringBuilder()
        var line: String?
        while (reader.readLine().also { line = it } != null) {
          sb.append(line)
        }
        reader.close()
        onResult(sb.toString(), null)
      } else {
        val reader = BufferedReader(InputStreamReader(conn.errorStream ?: conn.inputStream))
        val sb = java.lang.StringBuilder()
        var line: String?
        while (reader.readLine().also { line = it } != null) {
          sb.append(line)
        }
        reader.close()
        val errorMsg = try {
          JSONObject(sb.toString()).optString("error", "HTTP $responseCode")
        } catch (e: Exception) {
          "HTTP $responseCode"
        }
        onResult(null, errorMsg)
      }
    } catch (e: java.net.ConnectException) {
      onResult(null, "Cannot connect to server. Please verify GraftDesk server is running at port 3000.")
    } catch (e: Exception) {
      e.printStackTrace()
      onResult(null, e.message ?: "Connection failure.")
    }
  }.start()
}
