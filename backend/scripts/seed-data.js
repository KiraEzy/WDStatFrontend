import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.WDM_TABLE || "world_domination_metrics";

// Sample world domination metrics data
const sampleData = [
  {
    WDM_ID: "120120301230",
    WDM_playing_as: "CAN",
    WDM_record_game_date: "1940-08-21",
    WDM_start_wd_game_date: "1939-12-01",
    WDM_Update_datetime: "2024-01-01T09:00:00Z",
    WDM_Create_datetime: "2024-01-01T09:00:00Z"
  },
  {
    WDM_ID: "120120301231",
    WDM_playing_as: "USA",
    WDM_record_game_date: "1941-12-07",
    WDM_start_wd_game_date: "1939-09-01",
    WDM_Update_datetime: "2024-01-01T10:00:00Z",
    WDM_Create_datetime: "2024-01-01T10:00:00Z"
  },
  {
    WDM_ID: "120120301232",
    WDM_playing_as: "GER",
    WDM_record_game_date: "1942-06-15",
    WDM_start_wd_game_date: "1939-09-01",
    WDM_Update_datetime: "2024-01-01T11:00:00Z",
    WDM_Create_datetime: "2024-01-01T11:00:00Z"
  },
  {
    WDM_ID: "120120301233",
    WDM_playing_as: "SOV",
    WDM_record_game_date: "1943-02-02",
    WDM_start_wd_game_date: "1939-09-01",
    WDM_Update_datetime: "2024-01-01T12:00:00Z",
    WDM_Create_datetime: "2024-01-01T12:00:00Z"
  },
  {
    WDM_ID: "120120301234",
    WDM_playing_as: "UK",
    WDM_record_game_date: "1940-05-10",
    WDM_start_wd_game_date: "1939-09-01",
    WDM_Update_datetime: "2024-01-01T13:00:00Z",
    WDM_Create_datetime: "2024-01-01T13:00:00Z"
  },
  {
    WDM_ID: "120120301235",
    WDM_playing_as: "JAP",
    WDM_record_game_date: "1941-12-07",
    WDM_start_wd_game_date: "1939-09-01",
    WDM_Update_datetime: "2024-01-01T14:00:00Z",
    WDM_Create_datetime: "2024-01-01T14:00:00Z"
  },
  {
    WDM_ID: "120120301236",
    WDM_playing_as: "ITA",
    WDM_record_game_date: "1940-06-10",
    WDM_start_wd_game_date: "1939-09-01",
    WDM_Update_datetime: "2024-01-01T15:00:00Z",
    WDM_Create_datetime: "2024-01-01T15:00:00Z"
  },
  {
    WDM_ID: "120120301237",
    WDM_playing_as: "FRA",
    WDM_record_game_date: "1940-06-22",
    WDM_start_wd_game_date: "1939-09-01",
    WDM_Update_datetime: "2024-01-01T16:00:00Z",
    WDM_Create_datetime: "2024-01-01T16:00:00Z"
  }
];

async function seedData() {
  console.log(`Seeding data into table: ${TABLE_NAME}`);
  console.log(`Region: ${process.env.AWS_REGION || "us-east-1"}`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of sampleData) {
    try {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      });

      await docClient.send(command);
      console.log(`✓ Inserted: ${item.WDM_ID} - ${item.WDM_playing_as}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to insert ${item.WDM_ID}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`Success: ${successCount}, Errors: ${errorCount}`);
}

// Run the seeding
seedData().catch(console.error);

